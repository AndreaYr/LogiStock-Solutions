import sequelize from '../config/database.js';
import { Warehouse } from '../models/index.js';
import { WarehouseType, UtilitiesResponsible } from '../models/warehouseModel.js';

/**
 * Seeder para reemplazar todas las bodegas con 22 nuevas regionalizadas
 * en Quindío (Armenia, Pereira, Calarcá, Manizales) + Bogotá
 * 
 * Ejecución: npx tsx src/seeds/warehouseRegionalSeeder.ts
 */

interface WarehouseData {
  name: string;
  description: string;
  warehouseType: WarehouseType;
  city: string;
  address: string;
  postalCode: string;
  storageLength: number;
  storageWidth: number;
  storageHeight: number;
  usableArea: number;
  capacityOccupied: number;
  monthlyPrice: number;
  utilitiesIncluded: boolean;
  utilitiesResponsible: UtilitiesResponsible;
  utilitiesDetails: string;
  hasSecuritySystem: boolean;
  hasLoadingDock: boolean;
  hasParking: boolean;
  accessHours: string;
  isAvailable: boolean;
  imageUrl: string;
  imageUrls?: string[];
}

const warehousesData: WarehouseData[] = [
  // ============ ARMENIA, QUINDÍO (4 bodegas) ============
  {
    name: 'LogiStock Centro Armenia',
    description: 'Bodega general en el corazón comercial de Armenia. Ubicada sobre la carrera 19, ideal para distribuidoras y mayoristas. Control de temperatura, sistema de seguridad 24/7, muelle de carga y parqueadero amplio. Perfecto para productos secos y alimentos no perecederos.',
    warehouseType: 'GENERAL',
    city: 'Armenia',
    address: 'Carrera 19 #16-45, Centro Histórico',
    postalCode: '630001',
    storageLength: 35,
    storageWidth: 28,
    storageHeight: 7,
    usableArea: 900,
    capacityOccupied: 25,
    monthlyPrice: 2800000,
    utilitiesIncluded: true,
    utilitiesResponsible: 'ARRENDADOR',
    utilitiesDetails: 'Agua, Energía eléctrica, Aseo, Seguridad 24/7',
    hasSecuritySystem: true,
    hasLoadingDock: true,
    hasParking: true,
    accessHours: '24/7',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8ed7c83a7f?w=800&q=80',
    imageUrls: [
      'https://images.unsplash.com/photo-1586528116311-ad8ed7c83a7f?w=800&q=80',
      'https://images.unsplash.com/photo-1587280413801-cd6ccb8b188f?w=800&q=80',
      'https://images.unsplash.com/photo-1612244139837-9b847b30f639?w=800&q=80',
    ]
  },
  {
    name: 'LogiStock Frío Tropical Armenia',
    description: 'Cuarto frío especializado en alimentos perecederos, frutas tropicales, productos apícolas y flores. Temperaturas entre 2°C y 8°C. Sistema redundante de refrigeración. Cumple normas nacionales de cadena fría. Exportación de productos colombianos hacia mercados internacionales.',
    warehouseType: 'REFRIGERADA',
    city: 'Armenia',
    address: 'Diagonal 29 #20-60, Zona Industrial La Tebaida',
    postalCode: '630002',
    storageLength: 22,
    storageWidth: 18,
    storageHeight: 5,
    usableArea: 380,
    capacityOccupied: 50,
    monthlyPrice: 4200000,
    utilitiesIncluded: false,
    utilitiesResponsible: 'ARRENDATARIO',
    utilitiesDetails: 'Energía eléctrica (consumo refrigeración alto), Agua y Aseo por cuenta del cliente',
    hasSecuritySystem: true,
    hasLoadingDock: true,
    hasParking: true,
    accessHours: 'Lun–Sáb 5:00 AM – 10:00 PM',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&q=80',
    imageUrls: [
      'https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&q=80',
      'https://images.unsplash.com/photo-1574037519326-4a1d1f88f756?w=800&q=80',
      'https://images.unsplash.com/photo-1554224311-beee415c201f?w=800&q=80',
    ]
  },
  {
    name: 'LogiStock Artesanías y Delicados',
    description: 'Especializada en artesanías colombianas, productos frágiles, electrónicos y arte. Piso antiestático, control de humedad 40-60%, vigilancia privada con grabación HD 24/7. Acceso con escáner biométrico. Ideal para tiendas online y emprendimientos creativos.',
    warehouseType: 'DELICADOS',
    city: 'Armenia',
    address: 'Calle 21 #12-30, Centro Comercial Armenia',
    postalCode: '630003',
    storageLength: 18,
    storageWidth: 14,
    storageHeight: 4,
    usableArea: 240,
    capacityOccupied: 35,
    monthlyPrice: 2400000,
    utilitiesIncluded: true,
    utilitiesResponsible: 'ARRENDADOR',
    utilitiesDetails: 'Agua, Energía eléctrica, Clima artificial, Vigilancia',
    hasSecuritySystem: true,
    hasLoadingDock: false,
    hasParking: true,
    accessHours: 'Lun–Vie 7:00 AM – 7:00 PM / Sáb 8:00 AM – 2:00 PM',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&q=80',
    imageUrls: [
      'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&q=80',
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
    ]
  },
  {
    name: 'LogiStock Café Especial Armenia',
    description: 'Bodega especializada en almacenamiento de grano de café de calidad, manteniendo condiciones óptimas de humedad y aireación. Ubicado a 30 minutos del Eje Cafetero tradicional. Certificación de calidad. Ideal para exportadores y cooperativas cafeteras.',
    warehouseType: 'GENERAL',
    city: 'Armenia',
    address: 'Km 2 Vía Armenia - Calarcá, Zona Cafetera',
    postalCode: '630004',
    storageLength: 40,
    storageWidth: 30,
    storageHeight: 6,
    usableArea: 1100,
    capacityOccupied: 60,
    monthlyPrice: 3200000,
    utilitiesIncluded: true,
    utilitiesResponsible: 'ARRENDADOR',
    utilitiesDetails: 'Agua, Energía eléctrica, Aseo, Seguridad',
    hasSecuritySystem: true,
    hasLoadingDock: true,
    hasParking: true,
    accessHours: '24/7',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8ed7c83a7f?w=800&q=80',
    imageUrls: [
      'https://images.unsplash.com/photo-1586528116311-ad8ed7c83a7f?w=800&q=80',
      'https://images.unsplash.com/photo-1578575437980-ba2c7bda021b?w=800&q=80',
    ]
  },

  // ============ PEREIRA, RISARALDA (4 bodegas) ============
  {
    name: 'LogiStock Centro Pereira',
    description: 'Bodega general en zona comercial de Pereira. Excelente acceso vial desde la circunvalar. Servicios incluidos, muelle de carga para todo tipo de vehículos. Ideal para distribuidoras de repuestos, textiles y productos de consumo masivo.',
    warehouseType: 'GENERAL',
    city: 'Pereira',
    address: 'Calle 45 #9-20, Zona Comercial Centro',
    postalCode: '660001',
    storageLength: 32,
    storageWidth: 25,
    storageHeight: 7,
    usableArea: 750,
    capacityOccupied: 40,
    monthlyPrice: 2600000,
    utilitiesIncluded: true,
    utilitiesResponsible: 'ARRENDADOR',
    utilitiesDetails: 'Agua, Energía eléctrica, Aseo, Seguridad',
    hasSecuritySystem: true,
    hasLoadingDock: true,
    hasParking: true,
    accessHours: 'Lun–Sáb 6:00 AM – 8:00 PM',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8ed7c83a7f?w=800&q=80',
    imageUrls: [
      'https://images.unsplash.com/photo-1586528116311-ad8ed7c83a7f?w=800&q=80',
      'https://images.unsplash.com/photo-1587280413801-cd6ccb8b188f?w=800&q=80',
    ]
  },
  {
    name: 'LogiStock Frío Pereira',
    description: 'Refrigeración industrial para productos congelados, lácteos, carnes y mariscos. Temperatura controlada -18°C a 0°C. Sistema de redundancia para no perder cadena de frío. Acceso directo a carretera panamericana. Cumple con normativa INVIMA y calidad internacional.',
    warehouseType: 'REFRIGERADA',
    city: 'Pereira',
    address: 'Km 3.5 Vía Pereira–Armenia, Sector Industrial',
    postalCode: '660002',
    storageLength: 25,
    storageWidth: 20,
    storageHeight: 5,
    usableArea: 450,
    capacityOccupied: 65,
    monthlyPrice: 4500000,
    utilitiesIncluded: false,
    utilitiesResponsible: 'ARRENDATARIO',
    utilitiesDetails: 'Energía eléctrica (costo refrigeración variable), Agua y Aseo',
    hasSecuritySystem: true,
    hasLoadingDock: true,
    hasParking: true,
    accessHours: '24/7',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&q=80',
    imageUrls: [
      'https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&q=80',
      'https://images.unsplash.com/photo-1574037519326-4a1d1f88f756?w=800&q=80',
    ]
  },
  {
    name: 'LogiStock Maquinaria Pereira',
    description: 'Patio exterior especializado en almacenamiento de maquinaria pesada, equipos agrícolas, tractores y repuestos industriales. Acceso con retroexcavadora. Altura libre 8 metros. Piso reforzado para cargas puntuales hasta 10 toneladas. Cercado perimetral de seguridad.',
    warehouseType: 'EXTERIOR',
    city: 'Pereira',
    address: 'Parque Industrial El Cortijo, Bodega 12',
    postalCode: '660003',
    storageLength: 60,
    storageWidth: 35,
    storageHeight: 8,
    usableArea: 1800,
    capacityOccupied: 30,
    monthlyPrice: 1800000,
    utilitiesIncluded: false,
    utilitiesResponsible: 'ARRENDATARIO',
    utilitiesDetails: 'Cliente responsable de seguridad, iluminación',
    hasSecuritySystem: true,
    hasLoadingDock: true,
    hasParking: true,
    accessHours: '24/7',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80',
    imageUrls: [
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80',
    ]
  },
  {
    name: 'LogiStock Premium Pereira',
    description: 'Bodega VIP con seguridad de nivel banco. Sistema de CCTV de 360°, vigilancia privada 24/7, control de acceso con credencial y clave. Área independiente, puertas blindadas con sensores. Ideal para almacenamiento de valores, antigüedades y productos de muy alto valor.',
    warehouseType: 'VIP',
    city: 'Pereira',
    address: 'Complejo Premium Pereira, Edificio Bóveda',
    postalCode: '660004',
    storageLength: 15,
    storageWidth: 12,
    storageHeight: 4,
    usableArea: 160,
    capacityOccupied: 20,
    monthlyPrice: 6500000,
    utilitiesIncluded: true,
    utilitiesResponsible: 'ARRENDADOR',
    utilitiesDetails: 'Agua, Energía eléctrica 24/7, Vigilancia privada, Seguro',
    hasSecuritySystem: true,
    hasLoadingDock: false,
    hasParking: true,
    accessHours: '24/7 (acceso controlado)',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1516156008625-3a9d6067fab7?w=800&q=80',
    imageUrls: [
      'https://images.unsplash.com/photo-1516156008625-3a9d6067fab7?w=800&q=80',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
    ]
  },

  // ============ CALARCÁ, QUINDÍO (3 bodegas) ============
  {
    name: 'LogiStock Entrada Calarcá',
    description: 'Bodega de transbordo en la entrada a Calarcá, sobre la carretera principal Armenia-Bogotá. Ideal para distribuidoras que vienen del norte del país. Excelente para productos en tránsito, consolidación de carga y desconsolidación. Muelle directo a la vía.',
    warehouseType: 'GENERAL',
    city: 'Calarcá',
    address: 'Km 18 Vía Armenia-Bogotá, Entrada Calarcá',
    postalCode: '631001',
    storageLength: 38,
    storageWidth: 26,
    storageHeight: 6,
    usableArea: 950,
    capacityOccupied: 50,
    monthlyPrice: 2700000,
    utilitiesIncluded: true,
    utilitiesResponsible: 'ARRENDADOR',
    utilitiesDetails: 'Agua, Energía eléctrica, Aseo, Vigilancia',
    hasSecuritySystem: true,
    hasLoadingDock: true,
    hasParking: true,
    accessHours: '24/7',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8ed7c83a7f?w=800&q=80',
    imageUrls: [
      'https://images.unsplash.com/photo-1586528116311-ad8ed7c83a7f?w=800&q=80',
      'https://images.unsplash.com/photo-1587280413801-cd6ccb8b188f?w=800&q=80',
    ]
  },
  {
    name: 'LogiStock Agrícola Calarcá',
    description: 'Especializada en productos agrícolas del Eje Cafetero: café, plátano, papaya, piña y otros productos de agroexportación. Ventilación natural, control de humedad, sin temperatura artificial. Ideal para cooperativas y pequeños productores. Certificación de origen.',
    warehouseType: 'GENERAL',
    city: 'Calarcá',
    address: 'Calle Rural s/n, Vereda La Palmera',
    postalCode: '631002',
    storageLength: 35,
    storageWidth: 25,
    storageHeight: 6,
    usableArea: 820,
    capacityOccupied: 45,
    monthlyPrice: 1900000,
    utilitiesIncluded: true,
    utilitiesResponsible: 'ARRENDADOR',
    utilitiesDetails: 'Agua de pozo, Energía eléctrica, Aseo',
    hasSecuritySystem: true,
    hasLoadingDock: true,
    hasParking: true,
    accessHours: 'Lun–Sáb 6:00 AM – 6:00 PM',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&q=80',
    imageUrls: [
      'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&q=80',
      'https://images.unsplash.com/photo-1585329175054-7fdd55205fbb?w=800&q=80',
    ]
  },
  {
    name: 'LogiStock Distribuidores Calarcá',
    description: 'Centro de distribución para cadenas minoristas y mayoristas. Zona de picking optimizada, 8 muelles de carga simultáneos, sistema WMS compatible. Espacio dividible por áreas según cliente. Servicios 24/7 con equipo profesional de operarios.',
    warehouseType: 'GENERAL',
    city: 'Calarcá',
    address: 'Parque Logístico Calarcá, Lote 8',
    postalCode: '631003',
    storageLength: 45,
    storageWidth: 32,
    storageHeight: 8,
    usableArea: 1350,
    capacityOccupied: 70,
    monthlyPrice: 3600000,
    utilitiesIncluded: true,
    utilitiesResponsible: 'ARRENDADOR',
    utilitiesDetails: 'Agua, Energía eléctrica, Aseo, Servicios profesionales',
    hasSecuritySystem: true,
    hasLoadingDock: true,
    hasParking: true,
    accessHours: '24/7',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8ed7c83a7f?w=800&q=80',
    imageUrls: [
      'https://images.unsplash.com/photo-1586528116311-ad8ed7c83a7f?w=800&q=80',
      'https://images.unsplash.com/photo-1612244139837-9b847b30f639?w=800&q=80',
    ]
  },

  // ============ MANIZALES, CALDAS (3 bodegas) ============
  {
    name: 'LogiStock Centro Manizales',
    description: 'Bodega general en zona céntrica de Manizales sobre la Avenida 12 de Octubre. Excelente conectividad con municipios de Caldas, Quindío y Risaralda. Servicios incluidos, vigilancia permanente. Ideal para distribuidoras, tiendas online y pequeños emprendimientos.',
    warehouseType: 'GENERAL',
    city: 'Manizales',
    address: 'Avenida 12 de Octubre #23-45, Centro',
    postalCode: '170001',
    storageLength: 30,
    storageWidth: 22,
    storageHeight: 6,
    usableArea: 650,
    capacityOccupied: 35,
    monthlyPrice: 2300000,
    utilitiesIncluded: true,
    utilitiesResponsible: 'ARRENDADOR',
    utilitiesDetails: 'Agua, Energía eléctrica, Aseo, Vigilancia',
    hasSecuritySystem: true,
    hasLoadingDock: true,
    hasParking: true,
    accessHours: 'Lun–Sáb 7:00 AM – 7:00 PM',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8ed7c83a7f?w=800&q=80',
    imageUrls: [
      'https://images.unsplash.com/photo-1586528116311-ad8ed7c83a7f?w=800&q=80',
      'https://images.unsplash.com/photo-1587280413801-cd6ccb8b188f?w=800&q=80',
    ]
  },
  {
    name: 'LogiStock Gourmet Manizales',
    description: 'Cuarto frío para productos gourmet, quesos artesanales, embutidos finos, vinos y productos de alta cocina. Temperatura 4°C a 8°C. Sistema de humedad controlada. Acceso restringido, ideal para empresas gastronómicas y exportadores de alimentos especializados.',
    warehouseType: 'REFRIGERADA',
    city: 'Manizales',
    address: 'Zona Industrial Sur, Bodega 5',
    postalCode: '170002',
    storageLength: 20,
    storageWidth: 16,
    storageHeight: 5,
    usableArea: 320,
    capacityOccupied: 55,
    monthlyPrice: 3700000,
    utilitiesIncluded: false,
    utilitiesResponsible: 'ARRENDATARIO',
    utilitiesDetails: 'Energía eléctrica (refrigeración), Agua, Aseo',
    hasSecuritySystem: true,
    hasLoadingDock: true,
    hasParking: true,
    accessHours: 'Lun–Sáb 7:00 AM – 8:00 PM',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&q=80',
    imageUrls: [
      'https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&q=80',
      'https://images.unsplash.com/photo-1574037519326-4a1d1f88f756?w=800&q=80',
    ]
  },
  {
    name: 'LogiStock Parque Industrial Manizales',
    description: 'Bodega industrial grande en parque con infraestructura moderna. Rampa de acceso para montacargas de 5 toneladas. Múltiples muelles. Energía trifásica. Ideal para manufactura, importación de máquinas y distribución pesada. Flexible en extensión de contrato.',
    warehouseType: 'EXTERIOR',
    city: 'Manizales',
    address: 'Parque Industrial Manizales, Edificio Logístico 3',
    postalCode: '170003',
    storageLength: 50,
    storageWidth: 40,
    storageHeight: 7,
    usableArea: 1900,
    capacityOccupied: 40,
    monthlyPrice: 2800000,
    utilitiesIncluded: false,
    utilitiesResponsible: 'COMPARTIDO',
    utilitiesDetails: 'Energía eléctrica (medidor individual), Agua por cantidad',
    hasSecuritySystem: true,
    hasLoadingDock: true,
    hasParking: true,
    accessHours: '24/7',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80',
    imageUrls: [
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80',
    ]
  },

  // ============ BOGOTÁ (8 bodegas) ============
  {
    name: 'LogiStock Centro Bogotá',
    description: 'Bodega estratégica en la Zona Franca de Bogotá, centro de distribución de referencia nacional. Acceso directo a circunvalar, cercano a aeropuerto El Dorado (15 min) y terminales de transporte. Servicios premium, múltiples muelles, área de consolidación/desconsolidación.',
    warehouseType: 'GENERAL',
    city: 'Bogotá',
    address: 'Zona Franca Bogotá, Calle 13 #49-81',
    postalCode: '110221',
    storageLength: 50,
    storageWidth: 35,
    storageHeight: 8,
    usableArea: 1650,
    capacityOccupied: 55,
    monthlyPrice: 5500000,
    utilitiesIncluded: true,
    utilitiesResponsible: 'ARRENDADOR',
    utilitiesDetails: 'Agua, Energía trifásica, Aseo, Seguridad 24/7',
    hasSecuritySystem: true,
    hasLoadingDock: true,
    hasParking: true,
    accessHours: '24/7',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8ed7c83a7f?w=800&q=80',
    imageUrls: [
      'https://images.unsplash.com/photo-1586528116311-ad8ed7c83a7f?w=800&q=80',
      'https://images.unsplash.com/photo-1587280413801-cd6ccb8b188f?w=800&q=80',
      'https://images.unsplash.com/photo-1612244139837-9b847b30f639?w=800&q=80',
    ]
  },
  {
    name: 'LogiStock Frío Kennedy Bogotá',
    description: 'Centro de frío referencia en Bogotá. 4 módulos independientes de temperatura (-20°C, -5°C, 2°C, 8°C). Congelados, frescos, lácteos y farmacéuticos. Capacidad 800 toneladas. Sistema de redundancia x2. Cumple INVIMA y FDA. Exportación de productos a USA.',
    warehouseType: 'REFRIGERADA',
    city: 'Bogotá',
    address: 'Km 7 Calle 13, Kennedy',
    postalCode: '110222',
    storageLength: 40,
    storageWidth: 30,
    storageHeight: 6,
    usableArea: 1100,
    capacityOccupied: 75,
    monthlyPrice: 8200000,
    utilitiesIncluded: false,
    utilitiesResponsible: 'ARRENDATARIO',
    utilitiesDetails: 'Energía eléctrica (costo muy alto refrigeración), Agua, Aseo',
    hasSecuritySystem: true,
    hasLoadingDock: true,
    hasParking: true,
    accessHours: '24/7',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&q=80',
    imageUrls: [
      'https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&q=80',
      'https://images.unsplash.com/photo-1574037519326-4a1d1f88f756?w=800&q=80',
      'https://images.unsplash.com/photo-1554224311-beee415c201f?w=800&q=80',
    ]
  },
  {
    name: 'LogiStock Fontibón Aeropuerto Bogotá',
    description: 'Bodega a 8 minutos del Aeropuerto El Dorado. Ideal para importación y exportación. Aduanas rápida, trámites simplificados. Área de consolidación, buffer de cuarentena. Servicios para carga internacional, almacenamiento temporal en tránsito.',
    warehouseType: 'GENERAL',
    city: 'Bogotá',
    address: 'Km 12 Avenida Boyacá, Fontibón (cerca Aeropuerto)',
    postalCode: '110223',
    storageLength: 45,
    storageWidth: 32,
    storageHeight: 7,
    usableArea: 1350,
    capacityOccupied: 60,
    monthlyPrice: 6200000,
    utilitiesIncluded: true,
    utilitiesResponsible: 'ARRENDADOR',
    utilitiesDetails: 'Agua, Energía, Aseo, Vigilancia reforzada',
    hasSecuritySystem: true,
    hasLoadingDock: true,
    hasParking: true,
    accessHours: '24/7',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8ed7c83a7f?w=800&q=80',
    imageUrls: [
      'https://images.unsplash.com/photo-1586528116311-ad8ed7c83a7f?w=800&q=80',
      'https://images.unsplash.com/photo-1612244139837-9b847b30f639?w=800&q=80',
    ]
  },
  {
    name: 'LogiStock Suba Noroccidente Bogotá',
    description: 'Bodega general en zona norte (Suba), ideal para distribuidoras que sirven Cundinamarca norte. Acceso rápido a circunvalar y vías principales. Servicios completos. Apto para bienes de consumo, electrónica, textiles. Ambiente controlado.',
    warehouseType: 'GENERAL',
    city: 'Bogotá',
    address: 'Calle 174 #48-20, Suba',
    postalCode: '110224',
    storageLength: 38,
    storageWidth: 28,
    storageHeight: 7,
    usableArea: 1000,
    capacityOccupied: 45,
    monthlyPrice: 4200000,
    utilitiesIncluded: true,
    utilitiesResponsible: 'ARRENDADOR',
    utilitiesDetails: 'Agua, Energía eléctrica, Aseo, Vigilancia',
    hasSecuritySystem: true,
    hasLoadingDock: true,
    hasParking: true,
    accessHours: 'Lun–Dom 6:00 AM – 10:00 PM',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8ed7c83a7f?w=800&q=80',
    imageUrls: [
      'https://images.unsplash.com/photo-1586528116311-ad8ed7c83a7f?w=800&q=80',
      'https://images.unsplash.com/photo-1587280413801-cd6ccb8b188f?w=800&q=80',
    ]
  },
  {
    name: 'LogiStock Engativá Premium Bogotá',
    description: 'Bodega VIP en occidente con vigilancia de nivel banco. Puertas blindadas, control biométrico de acceso, CCTV con inteligencia artificial. Ideal para almacenamiento de mercancía valiosa, electrónica, joyería y productos restringidos. Seguro incluido.',
    warehouseType: 'VIP',
    city: 'Bogotá',
    address: 'Complejo Empresarial Engativá, Torre Logística A',
    postalCode: '110225',
    storageLength: 25,
    storageWidth: 20,
    storageHeight: 5,
    usableArea: 450,
    capacityOccupied: 30,
    monthlyPrice: 7500000,
    utilitiesIncluded: true,
    utilitiesResponsible: 'ARRENDADOR',
    utilitiesDetails: 'Agua, Energía 24/7 con UPS, Vigilancia privada, Seguro',
    hasSecuritySystem: true,
    hasLoadingDock: false,
    hasParking: true,
    accessHours: '24/7 (acceso controlado)',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1516156008625-3a9d6067fab7?w=800&q=80',
    imageUrls: [
      'https://images.unsplash.com/photo-1516156008625-3a9d6067fab7?w=800&q=80',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
    ]
  },
  {
    name: 'LogiStock Textiles Bogotá',
    description: 'Bodega especializada en textiles, ropa, calzado y confecciones. Ambiente libre de polvo, humedad controlada, perchas y batidoras. Ideal para industria de confección local, importadores y tiendas online de ropa. Servicios de planchado y etiquetado disponibles.',
    warehouseType: 'DELICADOS',
    city: 'Bogotá',
    address: 'Parque Empresarial San Alejo, Calle 63 #26-40',
    postalCode: '110226',
    storageLength: 32,
    storageWidth: 24,
    storageHeight: 6,
    usableArea: 720,
    capacityOccupied: 50,
    monthlyPrice: 3800000,
    utilitiesIncluded: true,
    utilitiesResponsible: 'ARRENDADOR',
    utilitiesDetails: 'Agua, Energía eléctrica, Clima artificial, Aseo',
    hasSecuritySystem: true,
    hasLoadingDock: true,
    hasParking: true,
    accessHours: 'Lun–Sáb 6:00 AM – 6:00 PM',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&q=80',
    imageUrls: [
      'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&q=80',
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
    ]
  },
  {
    name: 'LogiStock Farmacéutico Bogotá',
    description: 'Centro de distribución de medicamentos y productos farmacéuticos. Cumple normas INVIMA, BPD (Buenas Prácticas de Distribución). Control de temperatura 15–25°C, humedad 40–60%. Sistema de trazabilidad, área de cuarentena, documentación completa para farmacias y clínicas.',
    warehouseType: 'DELICADOS',
    city: 'Bogotá',
    address: 'Km 15 Calle 13, Zona Industrial Santa Ana',
    postalCode: '110227',
    storageLength: 35,
    storageWidth: 26,
    storageHeight: 6,
    usableArea: 880,
    capacityOccupied: 65,
    monthlyPrice: 5200000,
    utilitiesIncluded: true,
    utilitiesResponsible: 'ARRENDADOR',
    utilitiesDetails: 'Agua, Energía, Clima artificial, Vigilancia farmacéutica',
    hasSecuritySystem: true,
    hasLoadingDock: true,
    hasParking: true,
    accessHours: 'Lun–Sáb 6:00 AM – 8:00 PM',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&q=80',
    imageUrls: [
      'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&q=80',
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80',
    ]
  },
];

/**
 * Ejecuta el seed de bodegas regionalizadas
 */
const seedWarehouses = async () => {
  try {
    console.log('⏳ Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa.\n');

    // Sincronizar modelos (crear tablas si no existen)
    await sequelize.sync();

    // Eliminar todas las bodegas actuales
    console.log('🗑️  Eliminando bodegas antiguas...');
    const deletedCount = await Warehouse.destroy({ where: {} });
    console.log(`✅ ${deletedCount} bodegas eliminadas.\n`);

    // Crear nuevas bodegas
    console.log('⏳ Creando 22 bodegas regionalizadas...\n');
    for (let i = 0; i < warehousesData.length; i++) {
      const warehouse = await Warehouse.create(warehousesData[i]);
      console.log(`✅ [${i + 1}/22] ${warehouse.name} - ${warehouse.city}`);
    }

    console.log('\n✅ Seed completado exitosamente!');
    console.log('📊 22 bodegas creadas:');
    console.log('   - Armenia: 4 bodegas');
    console.log('   - Pereira: 4 bodegas');
    console.log('   - Calarcá: 3 bodegas');
    console.log('   - Manizales: 3 bodegas');
    console.log('   - Bogotá: 8 bodegas');
    console.log('\nTotalización por tipo:');
    const summary = await Warehouse.sequelize!.query(`
      SELECT warehouseType, COUNT(*) as count 
      FROM warehouses 
      GROUP BY warehouseType
    `, { raw: true });
    (summary[0] as any[]).forEach((row: any) => {
      console.log(`   - ${row.warehouseType}: ${row.count}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error en el seed:', error);
    process.exit(1);
  }
};

// Ejecutar
seedWarehouses();

