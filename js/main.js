import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.168.0/build/three.module.js';

const gsap = window.gsap;

console.log('main.js loaded successfully');
console.log('ScrollTrigger available:', typeof window.ScrollTrigger !== 'undefined' ? 'Yes' : 'No');
console.log('gsap loaded:', typeof gsap !== 'undefined' ? 'Yes' : 'No');

try {
  if (typeof gsap === 'undefined') {
    throw new Error('GSAP failed to load globally. Check the script tags in index.html.');
  }
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0); // Transparent background
  const webglDiv = document.getElementById('webgl');
  if (!webglDiv) throw new Error('WebGL container not found');
  webglDiv.appendChild(renderer.domElement);

  // Walls with corrected color
  const wallGeometry = new THREE.PlaneGeometry(6, 6);
  const wallMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffcc, transparent: true, opacity: 0.2, side: THREE.DoubleSide });
  const walls = [
    new THREE.Mesh(wallGeometry, wallMaterial),
    new THREE.Mesh(wallGeometry, wallMaterial),
    new THREE.Mesh(wallGeometry, wallMaterial),
    new THREE.Mesh(wallGeometry, wallMaterial),
    new THREE.Mesh(wallGeometry, wallMaterial),
    new THREE.Mesh(wallGeometry, wallMaterial)
  ];
  walls[0].position.z = -3;
  walls[1].position.z = 3; walls[1].rotation.y = Math.PI;
  walls[2].position.x = -3; walls[2].rotation.y = -Math.PI / 2;
  walls[3].position.x = 3; walls[3].rotation.y = Math.PI / 2;
  walls[4].position.y = 3; walls[4].rotation.x = Math.PI / 2;
  walls[5].position.y = -3; walls[5].rotation.x = -Math.PI / 2;
  walls.forEach(wall => scene.add(wall));

  // Particles
  const particlesGeometry = new THREE.BufferGeometry();
  const particlesCount = 2000;
  const posArray = new Float32Array(particlesCount * 3);
  for (let i = 0; i < particlesCount * 3; i++) posArray[i] = (Math.random() - 0.5) * 5;
  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
  const particlesMaterial = new THREE.PointsMaterial({ size: 0.02, color: 0x00ffcc });
  const particles = new THREE.Points(particlesGeometry, particlesMaterial);
  particles.visible = false;
  scene.add(particles);

  // Shader for skill spheres
  const skillMaterial = new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 } },
    vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `uniform float time; varying vec2 vUv; void main() { vec3 color = vec3(0.0, 1.0, 0.8); float glow = sin(time + vUv.x * 10.0) * 0.5 + 0.5; gl_FragColor = vec4(color * glow, 1.0); }`
  });

  const skills = [
    { name: 'Python', position: [1, 1, 0], description: 'Proficient in scripting and automation for cybersecurity.' },
    { name: 'Burp Suite', position: [-1, 1, 0], description: 'Expert in web vulnerability assessment.' },
    { name: 'Nmap', position: [1, -1, 0], description: 'Skilled in network scanning and reconnaissance.' },
    { name: 'Linux', position: [-1, -1, 0], description: 'Experienced with Kali and Ubuntu for pentesting.' }
  ];
  const skillMeshes = [];
  skills.forEach(skill => {
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.2), skillMaterial);
    sphere.position.set(...skill.position);
    sphere.userData = skill;
    sphere.visible = false;
    scene.add(sphere);
    skillMeshes.push(sphere);
  });

  camera.position.set(0, 0, 10);
  camera.lookAt(0, 0, 0);

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
      updateUI([{ title: skill.name, content: `<p>${skill.description}</p><button onclick="goToSkills()">Back to Skills</button>` }]);
    }
  });

  function animate() {
    requestAnimationFrame(animate);
    skillMaterial.uniforms.time.value += 0.05;
    if (currentSection === 'skills') {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(skillMeshes);
      skillMeshes.forEach(mesh => mesh.scale.set(1, 1, 1));
      if (intersects.length > 0) intersects[0].object.scale.set(1.5, 1.5, 1.5);
    }
    renderer.render(scene, camera);
  }
  animate();

  const loadingMessages = [
    'Initializing 3D Environment...',
    'Connecting to Cyber Matrix...',
    'Loading Neural Network...',
    'Scanning Security Protocols...',
    'Rendering Holographic Interface...',
    'Compiling Shader Code...',
    'Establishing Quantum Link...'
  ];

  function showLoadingScreen(callback) {
    const loadingScreen = document.getElementById('loading-screen');
    const messagesDiv = document.getElementById('terminal-messages');
    loadingScreen.style.display = 'flex';
    let messageIndex = 0;

    function displayNextMessage() {
      if (messageIndex < 3) {
        const message = document.createElement('p');
        message.textContent = `> ${loadingMessages[Math.floor(Math.random() * loadingMessages.length)]}`;
        messagesDiv.appendChild(message);
        setTimeout(displayNextMessage, 1500);
        messageIndex++;
      } else {
        setTimeout(() => {
          gsap.to(loadingScreen, {
            opacity: 0,
            duration: 0.5,
            onComplete: () => {
              loadingScreen.style.display = 'none';
              callback();
            }
          });
        }, 1000);
      }
    }
    displayNextMessage();
  }

  function updateUI(cards) {
    const container = document.getElementById('card-container');
    container.innerHTML = '';
    cards.forEach((card, index) => {
      const cardElement = document.createElement('div');
      cardElement.className = 'card' + (index === 0 ? ' active' : ' inactive');
      cardElement.innerHTML = `<h2>${card.title}</h2>${card.content}`;
      container.appendChild(cardElement);
    });
  }

  gsap.registerPlugin(window.ScrollTrigger);
  let scrollSections = [];

  function setupScrollTriggers() {
    scrollSections = [
      { title: 'About Me', content: '<p>Certified Penetration Tester with expertise in network security, ethical hacking, and full-stack development.<br>M.Sc. Physics, The New College, Chennai (2023).</p><button onclick="goToSkills()">View Skills</button>', trigger: 0 },
      { title: 'Skills', content: '<p>Scroll to explore my technical skills.</p>', trigger: 100 },
      { title: 'Projects', content: '<p>Ubuntu Pentesting Machine: Configured a customized Ubuntu environment for ethical hacking.<br>DoS Attack Simulation: Executed a controlled Denial-of-Service attack in a lab.</p><button onclick="goToContact()">Contact Me</button>', trigger: 200 },
      { title: 'Contact', content: '<p><a href="https://linkedin.com/in/salmanul-faris-68b7332f9">LinkedIn</a><br>Email: salmanulfaris642@gmail.com</p>', trigger: 300 }
    ];

    scrollSections.forEach((section, index) => {
      ScrollTrigger.create({
        trigger: '#card-container',
        start: `top ${section.trigger}vh`,
        end: `top ${section.trigger + 100}vh`,
        onEnter: () => {
          currentSection = section.title.toLowerCase().replace(' ', '');
          updateUI([{ title: section.title, content: section.content }]);
          gsap.to('.card', { className: 'card active', duration: 0.5 });
          if (index > 0) gsap.to('.card', { className: 'card inactive', duration: 0.5 });
          if (section.title === 'Skills') gsap.to(camera.position, { x: 0, y: 0, z: 2, duration: 1, ease: 'power2.inOut' });
          else if (section.title === 'Projects') gsap.to(camera.position, { x: 2, y: 2, z: 2, duration: 1, ease: 'power2.inOut' });
          else if (section.title === 'Contact') gsap.to(camera.position, { x: -2, y: -2, z: 2, duration: 1, ease: 'power2.inOut' });
        },
        onLeave: () => gsap.to('.card', { className: 'card inactive', duration: 0.5 }),
        onEnterBack: () => {
          currentSection = section.title.toLowerCase().replace(' ', '');
          updateUI([{ title: section.title, content: section.content }]);
          gsap.to('.card', { className: 'card active', duration: 0.5 });
          if (index > 0) gsap.to('.card', { className: 'card inactive', duration: 0.5 });
          if (section.title === 'Skills') gsap.to(camera.position, { x: 0, y: 0, z: 2, duration: 1, ease: 'power2.inOut' });
          else if (section.title === 'Projects') gsap.to(camera.position, { x: 2, y: 2, z: 2, duration: 1, ease: 'power2.inOut' });
          else if (section.title === 'Contact') gsap.to(camera.position, { x: -2, y: -2, z: 2, duration: 1, ease: 'power2.inOut' });
        }
      });
    });
  }

  window.startJourney = function () {
    currentSection = 'about';
    document.getElementById('ui-overlay').style.opacity = 0;
    showLoadingScreen(() => {
      document.getElementById('background').style.display = 'none';
      document.getElementById('webgl').style.display = 'block';
      walls.forEach(wall => wall.visible = true);
      particles.visible = true;
      skillMeshes.forEach(mesh => mesh.visible = true);
      gsap.to(camera.position, {
        z: 3,
        duration: 2,
        ease: 'power3.in',
        onUpdate: () => camera.lookAt(0, 0, 0)
      }).then(() => {
        gsap.to(camera.position, {
          x: 0,
          y: 0,
          z: 2,
          duration: 1.5,
          ease: 'power2.out',
          onComplete: () => {
            updateUI([{ title: 'About Me', content: '<p>Certified Penetration Tester with expertise in network security, ethical hacking, and full-stack development.<br>M.Sc. Physics, The New College, Chennai (2023).</p><button onclick="goToSkills()">View Skills</button>' }]);
            setTimeout(setupScrollTriggers, 100);
          }
        });
      });
    });
  };

  window.goToSkills = function () {
    currentSection = 'skills';
    gsap.to(camera.position, { x: 0, y: 0, z: 2, duration: 1, ease: 'power2.inOut' });
  };

  window.goToProjects = function () {
    currentSection = 'projects';
    gsap.to(camera.position, { x: 2, y: 2, z: 2, duration: 1, ease: 'power2.inOut' });
  };

  window.goToContact = function () {
    currentSection = 'contact';
    gsap.to(camera.position, { x: -2, y: -2, z: 2, duration: 1, ease: 'power2.inOut' });
  };

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

} catch (error) {
  console.error('Error in main.js:', error);
  alert('Error loading 3D scene. Check console (F12) for details.');
}
