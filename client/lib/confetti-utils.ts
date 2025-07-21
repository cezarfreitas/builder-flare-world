import confetti from 'canvas-confetti';

// Cores do tema morango
const STRAWBERRY_COLORS = [
  '#E91E63', // Rosa morango principal
  '#F8BBD9', // Rosa claro
  '#FCE4EC', // Rosa muito claro  
  '#FF6B9D', // Rosa vibrante
  '#C2185B', // Rosa escuro
  '#FFB6C1', // Rosa bebê
  '#FF1744', // Vermelho morango
  '#E57373', // Vermelho claro
];

// Confete padrão do tema morango
export const fireStrawberryConfetti = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: STRAWBERRY_COLORS
  });
};

// Confete de confirmação de presença (mais intenso)
export const fireConfirmationConfetti = () => {
  // Confete básico
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: STRAWBERRY_COLORS
  });

  // Confete lateral esquerdo
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: STRAWBERRY_COLORS
    });
  }, 200);

  // Confete lateral direito  
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: STRAWBERRY_COLORS
    });
  }, 400);

  // Confete final extra intenso
  setTimeout(() => {
    confetti({
      particleCount: 150,
      spread: 120,
      origin: { y: 0.7 },
      colors: STRAWBERRY_COLORS,
      gravity: 0.8
    });
  }, 600);
};

// Confete de evento criado (celebração máxima)
export const fireEventCreatedConfetti = () => {
  // Explosão central
  confetti({
    particleCount: 120,
    spread: 80,
    origin: { y: 0.5 },
    colors: STRAWBERRY_COLORS
  });

  // Chuva de confete
  setTimeout(() => {
    confetti({
      particleCount: 200,
      spread: 100,
      origin: { y: 0.3 },
      colors: STRAWBERRY_COLORS,
      gravity: 0.8
    });
  }, 300);

  // Confete em rajadas laterais
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 45,
      spread: 60,
      origin: { x: 0.1, y: 0.8 },
      colors: STRAWBERRY_COLORS
    });
    
    confetti({
      particleCount: 50,
      angle: 135,
      spread: 60,
      origin: { x: 0.9, y: 0.8 },
      colors: STRAWBERRY_COLORS
    });
  }, 600);

  // Grande finale
  setTimeout(() => {
    confetti({
      particleCount: 100,
      spread: 160,
      origin: { y: 0.4 },
      colors: ['#E91E63', '#FF1744'],
      scalar: 1.3
    });
  }, 900);
};

// Confete sutil para admin actions
export const fireAdminConfetti = () => {
  confetti({
    particleCount: 40,
    spread: 45,
    origin: { y: 0.7 },
    colors: ['#4CAF50', '#8BC34A', '#CDDC39', ...STRAWBERRY_COLORS.slice(0, 2)]
  });
};

// Confete especial para master admin login
export const fireMasterAdminConfetti = () => {
  confetti({
    particleCount: 80,
    spread: 60,
    origin: { y: 0.6 },
    colors: ['#E91E63', '#9C27B0', '#3F51B5', '#2196F3', '#FF5722', '#FFD700']
  });
  
  // Segundo round com cores douradas (VIP)
  setTimeout(() => {
    confetti({
      particleCount: 60,
      spread: 80,
      origin: { y: 0.4 },
      colors: ['#FFD700', '#FFA000', '#FF8F00', '#E91E63'],
      scalar: 1.1
    });
  }, 300);
};

// Confete continuous (chuva suave) - para momentos especiais
export const fireRainConfetti = () => {
  const duration = 3000; // 3 segundos
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 2,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: STRAWBERRY_COLORS
    });
    
    confetti({
      particleCount: 2,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: STRAWBERRY_COLORS
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };
  
  frame();
};
