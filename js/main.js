import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.168.0/build/three.module.js';

// Use global gsap (loaded in index.html)
const gsap = window.gsap;

// Debugging
console.log('main.js loaded successfully');

// Scene setup
try {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  const webglDiv = document.getElementById('webgl');
  if (!webglDiv) throw new Error('WebGL container not found');
  webglDiv.appendChild(renderer.domElement);

  // Add cube (placeholder for custom models)
  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshBasicMaterial({ color: 0x00ffcc, wireframe: true });
  const cube = new THREE.Mesh(geometry, material);
  cube.visible = false; // Hide initially
  scene.add(cube);

  // Add particles for atmosphere
  const particlesGeometry = new THREE.BufferGeometry();
  const particlesCount = 500;
  const posArray = new Float32Array(particlesCount * 3);
  for (let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 10;
  }
  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
  const particlesMaterial = new THREE.PointsMaterial({ size: 0.01, color: 0x00ffcc });
  const particles = new THREE.Points(particlesGeometry, particlesMaterial);
  particles.visible = false; // Hide initially
  scene.add(particles);

  // Lighting
  const pointLight = new THREE.PointLight(0x00ffcc, 1, 100);
  pointLight.position.set(5, 5, 5);
  pointLight.visible = false; // Hide initially
  scene.add(pointLight);

  // Shader for glowing skill spheres
  const skillMaterial = new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 } },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      varying vec2 vUv;
      void main() {
        vec3 color = vec3(0.0, 1.0, 0.8);
        float glow = sin(time + vUv.x * 10.0) * 0.5 + 0.5;
        gl_FragColor = vec4(color * glow, 1.0);
      }
    `
  });

  // Skills (interactive spheres with shader)
  const skills = [
    { name: 'Python', position: [2, 0, 0], description: 'Proficient in scripting and automation for cybersecurity.' },
    { name: 'Burp Suite', position: [-2, 0, 0], description: 'Expert in web vulnerability assessment.' },
    { name: 'Nmap', position: [0, 2, 0], description: 'Skilled in network scanning and reconnaissance.' },
    { name: 'Linux', position: [0, -2, 0], description: 'Experienced with Kali and Ubuntu for pentesting.' }
  ];
  const skillMeshes = [];
  skills.forEach(skill => {
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.2),
      skillMaterial
    );
    sphere.position.set(...skill.position);
    sphere.userData = skill;
    sphere.visible = false; // Hide initially
    scene.add(sphere);
    skillMeshes.push(sphere);
  });

  // Camera position (start high for fly-in)
  camera.position.set(0, 20, 10);
  camera.rotation.x = 0.5; // Initial tilt for dramatic fly-in

  // Raycasting for interactivity
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let currentSection = 'landing';

  window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  });

  window.addEventListener('click', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(skillMeshes);
    if (intersects.length > 0 && currentSection === 'skills') {
      const skill = intersects[0].object.userData;
      updateUI(`
        <h2>${skill.name}</h2>
        <p>${skill.description}</p>
        <button onclick="goToSkills()">Back to Skills</button>
      `);
    }
  });

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    skillMaterial.uniforms.time.value += 0.05; // Animate shader glow
    if (currentSection === 'skills') {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(skillMeshes);
      skillMeshes.forEach(mesh => {
        mesh.scale.set(1, 1, 1);
      });
      if (intersects.length > 0) {
        intersects[0].object.scale.set(1.5, 1.5, 1.5);
      }
    }
    renderer.render(scene, camera);
  }
  animate();

  // UI update function
  function updateUI(content) {
    const ui = document.getElementById('ui-overlay');
    ui.style.opacity = 0;
    setTimeout(() => {
      ui.innerHTML = content;
      gsap.to(ui, { opacity: 1, duration: 0.5 });
    }, 500);
  }

  // Cinematic transitions
  window.startJourney = function () {
    currentSection = 'about';
    document.getElementById('background').style.display = 'none'; // Hide background
    document.getElementById('webgl').style.display = 'block'; // Show 3D canvas
    cube.visible = true;
    particles.visible = true;
    pointLight.visible = true;
    skillMeshes.forEach(mesh => mesh.visible = true);
    document.getElementById('ui-overlay').style.opacity = 0;
    gsap.to(camera.position, {
      y: 0,
      z: 10,
      duration: 3,
      ease: 'power2.inOut'
    });
    gsap.to(camera.rotation, {
      x: -0.5,
      duration: 3,
      ease: 'power2.inOut',
      onComplete: () => {
        updateUI(`
          <h2>About Me</h2>
          <p>Certified Penetration Tester with expertise in network security, ethical hacking, and full-stack development.<br>M.Sc. Physics, The New College, Chennai (2023).</p>
          <button onclick="goToSkills()">View Skills</button>
        `);
      }
    });
  };

  window.goToSkills = function () {
    currentSection = 'skills';
    gsap.to(camera.position, {
      x: 0,
      y: 0,
      z: 5,
      duration: 2,
      ease: 'power2.inOut',
      onComplete: () => {
        updateUI(`
          <h2>Skills</h2>
          <p>Click on the spheres to explore my technical skills.</p>
          <button onclick="goToProjects()">View Projects</button>
          <button onclick="goToContact()">Contact Me</button>
        `);
      }
    });
  };

  window.goToProjects = function () {
    currentSection = 'projects';
    gsap.to(camera.position, {
      x: 5,
      y: 5,
      z: 5,
      duration: 2,
      ease: 'power2.inOut',
      onComplete: () => {
        updateUI(`
          <h2>Projects</h2>
          <p>Ubuntu Pentesting Machine: Configured a customized Ubuntu environment for ethical hacking.<br>DoS Attack Simulation: Executed a controlled Denial-of-Service attack in a lab.</p>
          <button onclick="goToSkills()">Back to Skills</button>
          <button onclick="goToContact()">Contact Me</button>
        `);
      }
    });
  };

  window.goToContact = function () {
    currentSection = 'contact';
    gsap.to(camera.position, {
      x: -5,
      y: -5,
      z: 5,
      duration: 2,
      ease: 'power2.inOut',
      onComplete: () => {
        updateUI(`
          <h2>Contact</h2>
          <p><a href="https://linkedin.com/in/salmanul-faris-68b7332f9">LinkedIn</a><br>Email: salmanulfaris642@gmail.com</p>
          <button onclick="goToSkills()">Back to Skills</button>
        `);
      }
    });
  };

  // Handle resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

} catch (error) {
  console.error('Error in main.js:', error);
  alert('Error loading 3D scene. Check console (F12) for details.');
}
