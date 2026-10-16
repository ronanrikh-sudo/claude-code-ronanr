// The 3D layer: one instanced mesh of rounded cubes (with a per-instance glow), the arena,
// lights that move from fight-night to showcase, and a bloom pass so teal and pink glow.
import React, { useEffect, useMemo, useRef, useState } from "react";
import { continueRender, delayRender, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { FPS, HEIGHT, WIDTH } from "../config";
import { THEME } from "../theme";
import { M, word } from "../timing";
import { CubeSystem } from "./cubes";
import { buildFormations, CubeT } from "./formations";
import { rasterLogo, rasterText } from "./raster";
import { cameraAt } from "./camera";

const smooth = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));

/** Build the cube system once the font and logo are rasterised. */
const useCubeSystem = () => {
  const [sys, setSys] = useState<CubeSystem | null>(null);
  const [handle] = useState(() => delayRender("rasterise type + logo, assign cubes"));
  useEffect(() => {
    Promise.all([rasterText("40%", 12), rasterLogo(10)]).then(([g40, gLogo]) => {
      setSys(new CubeSystem(buildFormations(g40, gLogo)));
      continueRender(handle);
    });
  }, [handle]);
  return sys;
};

const glowMaterial = () => {
  const m = new THREE.MeshStandardMaterial({ roughness: 0.36, metalness: 0.18, envMapIntensity: 0.7 });
  m.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", "#include <common>\nattribute float aGlow;\nvarying float vGlow;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvGlow = aGlow;");
    sh.fragmentShader = sh.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying float vGlow;")
      .replace("#include <emissivemap_fragment>", "#include <emissivemap_fragment>\ntotalEmissiveRadiance += diffuseColor.rgb * vGlow * 1.6;");
  };
  return m;
};

const Cubes: React.FC<{ sys: CubeSystem; frameRef: React.MutableRefObject<number> }> = ({ sys, frameRef }) => {
  const N = sys.cubes.length;
  const { camera } = useThree();
  const ref = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(() => {
    const g = new RoundedBoxGeometry(1, 1, 1, 2, 0.11);
    g.setAttribute("aGlow", new THREE.InstancedBufferAttribute(new Float32Array(N), 1));
    return g;
  }, [N]);
  const mat = useMemo(glowMaterial, []);
  const o = useMemo<CubeT>(() => ({ pos: new THREE.Vector3(), quat: new THREE.Quaternion(), scale: 0, color: new THREE.Color(), glow: 0 }), []);
  useFrame(() => {
    const im = ref.current;
    if (!im) return;
    const t = frameRef.current / FPS;
    const m = new THREE.Matrix4(), s = new THREE.Vector3();
    const glow = geo.getAttribute("aGlow") as THREE.InstancedBufferAttribute;
    for (let i = 0; i < N; i++) {
      sys.state(i, t, o);
      // never let a cube smear across the lens
      const near = smooth((o.pos.distanceTo(camera.position) - 0.35) / 0.5);
      s.setScalar(Math.max(1e-4, o.scale * near));
      im.setMatrixAt(i, m.compose(o.pos, o.quat, s));
      im.setColorAt(i, o.color);
      glow.setX(i, o.glow);
    }
    im.instanceMatrix.needsUpdate = true;
    if (im.instanceColor) im.instanceColor.needsUpdate = true;
    glow.needsUpdate = true;
  }, -2);
  return <instancedMesh ref={ref} args={[geo, mat, N]} frustumCulled={false} />;
};

const OCTAGON = (() => {
  const pts: THREE.Vector3[] = [];
  for (let k = 0; k <= 8; k++) { const a = (k / 8) * Math.PI * 2 + Math.PI / 8; pts.push(new THREE.Vector3(Math.cos(a) * 3.1, 0.002, Math.sin(a) * 3.1)); }
  return new THREE.BufferGeometry().setFromPoints(pts);
})();

const Stage: React.FC<{ frameRef: React.MutableRefObject<number> }> = ({ frameRef }) => {
  const { gl, scene, camera, size } = useThree();
  const floorMat = useRef<THREE.MeshStandardMaterial>(null);
  const lineMat = useRef<THREE.LineBasicMaterial>(null);
  const spot = useRef<THREE.SpotLight>(null);
  const rimR = useRef<THREE.PointLight>(null);
  const rimB = useRef<THREE.PointLight>(null);
  const key = useRef<THREE.DirectionalLight>(null);
  const back = useRef<THREE.DirectionalLight>(null);

  const composer = useMemo(() => {
    scene.background = new THREE.Color(THEME.bg);
    scene.fog = new THREE.Fog(THEME.fog, 8, 19);
    const pm = new THREE.PMREMGenerator(gl);
    scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.45;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.0;
    const c = new EffectComposer(gl);
    c.setPixelRatio(1);
    c.setSize(size.width, size.height);
    c.addPass(new RenderPass(scene, camera));
    c.addPass(new UnrealBloomPass(new THREE.Vector2(size.width, size.height), 0.5, 0.42, 1.0));
    c.addPass(new OutputPass());
    return c;
  }, [gl, scene, camera, size.width, size.height]);

  useFrame(() => {
    const t = frameRef.current / FPS;
    const cam = camera as THREE.PerspectiveCamera;
    const c = cameraAt(t);
    cam.fov = c.fov; cam.near = 0.05; cam.far = 200;
    cam.position.copy(c.pos);
    cam.lookAt(c.look);
    cam.updateProjectionMatrix();
    // fight night -> showcase
    const show = smooth((t - word("the")) / 0.9);
    const arena = 1 - show;
    if (floorMat.current) floorMat.current.opacity = arena;
    if (lineMat.current) lineMat.current.opacity = 0.55 * arena;
    if (spot.current) spot.current.intensity = 60 * arena + 10;
    if (rimR.current) rimR.current.intensity = 14 * arena;
    if (rimB.current) rimB.current.intensity = 14 * arena;
    if (key.current) key.current.intensity = 2.6 * show;
    if (back.current) {
      back.current.intensity = 1.6 * show + 0.4;
      back.current.color.set(t > word("free") - 0.3 && t < word("months") - 0.2 ? THEME.pink : THEME.teal);
    }
  }, -1);
  useFrame(() => composer.render(), 1);

  return (
    <>
      <hemisphereLight args={["#9aa3b5", "#000000", 0.16]} />
      <spotLight ref={spot} position={[0.3, 6.5, -1.6]} angle={0.55} penumbra={0.75} decay={2} castShadow={false}
        target-position={[0, 1.2, -0.2]} />
      <pointLight ref={rimR} position={[-2.2, 2.3, 1.9]} color={THEME.corner.red} decay={2} />
      <pointLight ref={rimB} position={[2.2, 2.3, 1.9]} color={THEME.corner.blue} decay={2} />
      <directionalLight position={[0.5, 2.0, -5]} intensity={0.55} />
      <directionalLight ref={key} position={[2.5, 5, 6]} />
      <directionalLight ref={back} position={[0, 3.5, -5]} />
      <mesh rotation-x={-Math.PI / 2}>
        <circleGeometry args={[7, 64]} />
        <meshStandardMaterial ref={floorMat} color={THEME.floor} roughness={0.92} metalness={0} transparent />
      </mesh>
      <lineLoop geometry={OCTAGON}>
        <lineBasicMaterial ref={lineMat} color={THEME.cageLine} transparent />
      </lineLoop>
    </>
  );
};

export const World: React.FC = () => {
  const frame = useCurrentFrame();
  const frameRef = useRef(frame);
  frameRef.current = frame;
  const sys = useCubeSystem();
  return (
    <ThreeCanvas width={WIDTH} height={HEIGHT} camera={{ fov: 40, position: [0, 1.5, -5] }}
      gl={{ antialias: true, powerPreference: "high-performance" }} style={{ position: "absolute", inset: 0 }}>
      <Stage frameRef={frameRef} />
      {sys && <Cubes sys={sys} frameRef={frameRef} />}
    </ThreeCanvas>
  );
};

export { M };
