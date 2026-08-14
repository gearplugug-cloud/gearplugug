/**
 * 10 sample media-equipment products for testing checkout.
 * Prices are in UGX (Ugandan Shillings).
 * All items feature camera/lens/sound specifications for the new architectural eBay layout.
 */
const SAMPLE_PRODUCTS = [
  {
    id: 'sp-001',
    name: 'Sony FX6 Cinema Camera',
    brand: 'Sony',
    category: 'Camera Bodies',
    price: 12500000,
    img: '/fx6_camera_1782841415607.png',
    description: 'Full-frame cinema camera with 4K 120fps, dual base ISO, and modular design for professional filmmakers.',
    condition: 'Used - Mint',
    sellerRating: '4.9 ★ (124 reviews)',
    watchers: 14,
    specs: {
      lensMount: 'Sony E-mount',
      sensorSize: 'Full Frame (35.6 x 23.8 mm)',
      maxResolution: '4K DCI (4096 x 2160) up to 120p',
      shutterCount: '480 hours (Operating Time)',
      inclusions: 'Top handle, 3.5" LCD monitor, BP-U35 battery, BC-U1A charger, AC adapter'
    }
  },
  {
    id: 'sp-002',
    name: 'Canon RF 24-70mm f/2.8L IS USM',
    brand: 'Canon',
    category: 'Lenses',
    price: 3200000,
    img: '/canon_lens_1782841425731.png',
    description: 'Professional-grade zoom lens with constant f/2.8 aperture, ideal for documentary and event coverage.',
    condition: 'Used - Like New',
    sellerRating: '4.8 ★ (92 reviews)',
    watchers: 8,
    specs: {
      lensMount: 'Canon RF',
      focalLength: '24-70mm',
      maxAperture: 'f/2.8',
      glassCondition: 'Mint (No scratches or dust)',
      inclusions: 'Front/rear caps, lens hood, soft pouch, original packaging'
    }
  },
  {
    id: 'sp-003',
    name: 'Sennheiser MKH 416 Shotgun Microphone',
    brand: 'Sennheiser',
    category: 'Sound Equipment',
    price: 1800000,
    img: '/sennheiser_mic_1782841434894.png',
    description: 'Industry-standard shotgun microphone for broadcast, film, and outdoor recording.',
    condition: 'Used - Good',
    sellerRating: '5.0 ★ (45 reviews)',
    watchers: 5,
    specs: {
      connectionType: 'XLR (3-pin)',
      polarPattern: 'Supercardioid / Lobar',
      microphoneType: 'Shotgun RF Condenser',
      inclusions: 'MZW 415 foam windscreen, MZQ 415 stand mount, hard carry case'
    }
  },
  {
    id: 'sp-004',
    name: 'DJI RS 3 Pro Gimbal Stabilizer',
    brand: 'DJI',
    category: 'Accessories',
    price: 2700000,
    img: '/dji_gimbal_1782841445580.png',
    description: '3-axis gimbal stabiliser with LiDAR focusing, supporting payloads up to 4.5 kg.',
    condition: 'Open Box',
    sellerRating: '4.7 ★ (89 reviews)',
    watchers: 19,
    specs: {
      loadCapacity: '4.5 kg',
      compatibility: 'Sony, Canon, RED, Blackmagic, Panasonic',
      stabilizationType: '3-axis gimbal',
      inclusions: 'Briefcase handle, phone holder, focus motor, control cables, carry case'
    }
  },
  {
    id: 'sp-005',
    name: 'Manfrotto 504X Fluid Head Tripod',
    brand: 'Manfrotto',
    category: 'Tripods & Lighting',
    price: 2100000,
    img: '/manfrotto_tripod_1782841462760.png',
    description: 'Professional video tripod with fluid head, 12 kg payload capacity, and carbon-fibre legs.',
    condition: 'Used - Good',
    sellerRating: '4.6 ★ (34 reviews)',
    watchers: 3,
    specs: {
      loadCapacity: '12 kg',
      heightRange: '39 to 175 cm',
      bowlSize: '75 mm',
      inclusions: 'Fluid head, carbon legs, mid-level spreader, quick release plate, carry bag'
    }
  },
  {
    id: 'sp-006',
    name: 'Blackmagic URSA Mini Pro 12K',
    brand: 'Blackmagic',
    category: 'Camera Bodies',
    price: 22000000,
    img: '/blackmagic_ursa_1782841473178.png',
    description: '12K Super 35 sensor cinema camera with built-in ND filters and Blackmagic RAW recording.',
    condition: 'Used - Like New',
    sellerRating: '4.9 ★ (76 reviews)',
    watchers: 22,
    specs: {
      lensMount: 'ARRI PL (Canon EF mount included)',
      sensorSize: 'Super 35 (27.03 x 14.25 mm)',
      maxResolution: '12K (12288 x 6480) up to 60p',
      shutterCount: '120 hours (Operating Time)',
      inclusions: 'PL mount installed, EF mount, V-mount battery plate, power adapter'
    }
  },
  {
    id: 'sp-007',
    name: 'Sigma 18-35mm f/1.8 Art (Canon EF)',
    brand: 'Sigma',
    category: 'Lenses',
    price: 2400000,
    img: '/sigma_lens_1782841483965.png',
    description: 'The world\'s first f/1.8 constant-aperture zoom lens — a favourite for indie filmmakers.',
    condition: 'Used - Good',
    sellerRating: '4.8 ★ (110 reviews)',
    watchers: 11,
    specs: {
      lensMount: 'Canon EF',
      focalLength: '18-35mm',
      maxAperture: 'f/1.8',
      glassCondition: 'Clean, light internal dust (does not affect image)',
      inclusions: 'Front/rear caps, lens hood, padded zip bag'
    }
  },
  {
    id: 'sp-008',
    name: 'Rode Wireless GO II Microphone',
    brand: 'Rode',
    category: 'Sound Equipment',
    price: 950000,
    img: '/rode_wireless_1782841493569.png',
    description: 'Dual-channel wireless microphone system with on-board recording and 200 m range.',
    condition: 'Brand New',
    sellerRating: '4.9 ★ (210 reviews)',
    watchers: 27,
    specs: {
      connectionType: 'USB-C / 3.5mm TRS',
      wirelessRange: '200 m (line of sight)',
      microphoneType: 'Dual wireless lapel system',
      inclusions: '2x transmitters, 1x receiver, 3x furry windscreens, pouch, cables'
    }
  },
  {
    id: 'sp-009',
    name: 'Aputure Light Storm 600d Pro LED',
    brand: 'Aputure',
    category: 'Tripods & Lighting',
    price: 5500000,
    img: '/aputure_light_1782841503328.png',
    description: '600 W daylight-balanced LED with Bowens mount, wireless control, and weather sealing.',
    condition: 'Used - Mint',
    sellerRating: '5.0 ★ (18 reviews)',
    watchers: 15,
    specs: {
      lightSource: '600W COB LED',
      colorTemp: '5600K (Daylight)',
      powerOutput: '98,500+ lux @ 1m (with reflector)',
      inclusions: 'Control box, hyper-reflector, clamp, power cords, rolling case'
    }
  },
  {
    id: 'sp-010',
    name: 'SmallRig 99Wh V-Mount Battery Kit',
    brand: 'SmallRig',
    category: 'Accessories',
    price: 680000,
    img: '/smallrig_battery_1782841513579.png',
    description: 'Dual 99 Wh V-mount batteries with D-Tap and USB-C outputs, plus dual charger.',
    condition: 'Brand New',
    sellerRating: '4.8 ★ (58 reviews)',
    watchers: 31,
    specs: {
      loadCapacity: '99 Wh / 6.8 Ah',
      compatibility: 'D-Tap, USB-C, USB-A, DC 8V/12V',
      batteryType: 'V-Mount Lithium-Ion',
      inclusions: '2x batteries, 1x dual-channel charger, D-Tap cable'
    }
  },
];

export default SAMPLE_PRODUCTS;
