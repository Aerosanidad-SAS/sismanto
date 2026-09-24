// Departamentos oficiales de Colombia (DIVIPOLA, DANE) — lista estática,
// no cambia.
export const DEPARTAMENTOS_COLOMBIA = [
  "Amazonas",
  "Antioquia",
  "Arauca",
  "Atlántico",
  "Bogotá D.C.",
  "Bolívar",
  "Boyacá",
  "Caldas",
  "Caquetá",
  "Casanare",
  "Cauca",
  "Cesar",
  "Chocó",
  "Córdoba",
  "Cundinamarca",
  "Guainía",
  "Guaviare",
  "Huila",
  "La Guajira",
  "Magdalena",
  "Meta",
  "Nariño",
  "Norte de Santander",
  "Putumayo",
  "Quindío",
  "Risaralda",
  "San Andrés y Providencia",
  "Santander",
  "Sucre",
  "Tolima",
  "Valle del Cauca",
  "Vaupés",
  "Vichada",
] as const;

// Municipios de Colombia (DIVIPOLA/DANE) por departamento — export real de la
// tabla "subregiones" de SISRES (León, 2026-07-29, 1.119 filas, ver
// QA_HALLAZGOS.md). Bogotá D.C. no viene en ese export porque en DIVIPOLA es
// distrito capital, no un departamento con municipios subordinados — se
// agrega acá como caso especial de una sola ciudad (ella misma).
export const MUNICIPIOS_POR_DEPARTAMENTO: Record<string, readonly string[]> = {
  "Amazonas": ["El Encanto", "La Chorrera", "La Pedrera", "La Victoria", "Leticia", "Miriti Paraná", "Puerto Alegria", "Puerto Arica", "Puerto Nariño", "Puerto Santander", "Tarapacá"],
  "Antioquia": ["Abejorral", "Abriaquí", "Alejandría", "Amaga", "Amalfi", "Andes", "Angelopolis", "Angostura", "Anorí", "Anza", "Apartadó", "Arboletes", "Argelia", "Armenia", "Barbosa", "Bello", "Belmira", "Betania", "Betulia", "Briceño", "Buriticá", "Cáceres", "Caicedo", "Caldas", "Campamento", "Cañasgordas", "Caracolí", "Caramanta", "Carepa", "Carmen De Viboral", "Carolina", "Caucasia", "Chigorodó", "Cisneros", "Ciudad Bolívar", "Cocorná", "Concepción", "Concordia", "Copacabana", "Dabeiba", "Don Matias", "Ebéjico", "El Bagre", "Entrerrios", "Envigado", "Fredonia", "Frontino", "Giraldo", "Girardota", "Gómez Plata", "Granada", "Guadalupe", "Guarne", "Guatape", "Heliconia", "Hispania", "Itagui", "Ituango", "Jardín", "Jericó", "La Ceja", "La Estrella", "La Pintada", "La Unión", "Liborina", "Maceo", "Marinilla", "Medellín", "Montebello", "Murindó", "Mutata", "Nariño", "Nechí", "Necoclí", "Olaya", "Peñol", "Peque", "Pueblorrico", "Puerto Berrio", "Puerto Nare", "Puerto Triunfo", "Remedios", "Retiro", "Rionegro", "Sabanalarga", "Sabaneta", "Salgar", "San Andrés", "San Carlos", "San Francisco", "San Jerónimo", "San José De La Montaña", "San Juan De Uraba", "San Luis", "San Pedro", "San Pedro De Uraba", "San Rafael", "San Roque", "San Vicente", "Santa Barbara", "Santa Rosa De Osos", "Santafé De Antioquia", "Santo Domingo", "Santuario", "Segovia", "Sonson", "Sopetran", "Támesis", "Tarazá", "Tarso", "Titiribí", "Toledo", "Turbo", "Uramita", "Urrao", "Valdivia", "Valparaiso", "Vegachí", "Venecia", "Vigía Del Fuerte", "Yalí", "Yarumal", "Yolombó", "Yondó", "Zaragoza"],
  "Arauca": ["Arauca", "Arauquita", "Cravo Norte", "Fortul", "Puerto Rondón", "Saravena", "Tame"],
  "Atlántico": ["Baranoa", "Barranquilla", "Campo De La Cruz", "Candelaria", "Galapa", "Juan De Acosta", "Luruaco", "Malambo", "Manati", "Palmar De Varela", "Piojó", "Polonuevo", "Ponedera", "Puerto Colombia", "Repelon", "Sabanagrande", "Sabanalarga", "Santa Lucia", "Santo Tomas", "Soledad", "Suan", "Tubara", "Usiacuri"],
  "Bogotá D.C.": ["Bogotá D.C."],
  "Bolívar": ["Achí", "Altos Del Rosario", "Arenal", "Arjona", "Arroyohondo", "Barranco De Loba", "Calamar", "Cantagallo", "Carmen De Bolívar", "Cartagena", "Cicuco", "Clemencia", "Córdoba", "El Guamo", "El Peñon", "Hatillo De Loba", "Magangué", "Mahates", "Margarita", "María La Baja", "Mompós", "Montecristo", "Morales", "Pinillos", "Regidor", "Río Viejo", "San Cristobal", "San Estanislao", "San Fernando", "San Jacinto", "San Jacinto Del Cauca", "San Juan Nepomuceno", "San Martin De Loba", "San Pablo", "Santa Catalina", "Santa Rosa De Lima", "Santa Rosa Del Sur", "Simití", "Soplaviento", "Talaigua Nuevo", "Tiquisio", "Turbaco", "Turbana", "Villanueva", "Zambrano"],
  "Boyacá": ["Almeida", "Aquitania", "Arcabuco", "Belén", "Berbeo", "Betéitiva", "Boavita", "Boyacá", "Briceño", "Buenavista", "Busbanzá", "Caldas", "Campohermoso", "Cerinza", "Chinavita", "Chiquinquirá", "Chíquiza", "Chiscas", "Chita", "Chitaraque", "Chivatá", "Chivor", "Ciénega", "Cómbita", "Coper", "Corrales", "Covarachía", "Cubará", "Cucaita", "Cuítiva", "Duitama", "El Cocuy", "El Espino", "Firavitoba", "Floresta", "Gachantivá", "Gameza", "Garagoa", "Guacamayas", "Guateque", "Guayatá", "Güicán", "Iza", "Jenesano", "Jericó", "La Capilla", "La Uvita", "La Victoria", "Labranzagrande", "Macanal", "Maripí", "Miraflores", "Mongua", "Monguí", "Moniquirá", "Motavita", "Muzo", "Nobsa", "Nuevo Colón", "Oicatá", "Otanche", "Pachavita", "Páez", "Paipa", "Pajarito", "Panqueba", "Pauna", "Paya", "Paz De Río", "Pesca", "Pisba", "Puerto Boyaca", "Quípama", "Ramiriquí", "Ráquira", "Rondón", "Saboyá", "Sáchica", "Samacá", "San Eduardo", "San José De Pare", "San Luis De Gaceno", "San Mateo", "San Miguel De Sema", "San Pablo Borbur", "San Rosa Viterbo", "Santa María", "Santa Sofía", "Santana", "Sativanorte", "Sativasur", "Siachoque", "Soatá", "Socha", "Socotá", "Sogamoso", "Somondoco", "Sora", "Soracá", "Sotaquirá", "Susacón", "Sutamarchán", "Sutatenza", "Tasco", "Tenza", "Tibaná", "Tibasosa", "Tinjacá", "Tipacoque", "Toca", "Togüí", "Tópaga", "Tota", "Tunja", "Tununguá", "Turmequé", "Tuta", "Tutazá", "Umbita", "Ventaquemada", "Villa De Leyva", "Viracachá", "Zetaquira"],
  "Caldas": ["Aguadas", "Anserma", "Aranzazu", "Belalcázar", "Chinchina", "Filadelfia", "La Dorada", "La Merced", "Manizales", "Manzanares", "Marmato", "Marquetalia", "Marulanda", "Neira", "Norcasia", "Pácora", "Palestina", "Pensilvania", "Riosucio", "Risaralda", "Salamina", "Samaná", "San José", "Supía", "Victoria", "Villamaria", "Viterbo"],
  "Caquetá": ["Albania", "Belén De Los Andaquies", "Cartagena Del Chairá", "Currillo", "El Doncello", "El Paujil", "Florencia", "La Montañita", "Milan", "Morelia", "Puerto Rico", "San Jose Del Fragua", "San Vicente Del Caguán", "Solano", "Solita", "Valparaiso"],
  "Casanare": ["Aguazul", "Chameza", "Hato Corozal", "La Salina", "Maní", "Monterrey", "Nunchía", "Orocué", "Paz De Ariporo", "Pore", "Recetor", "Sabanalarga", "Sácama", "San Luis De Palenque", "Támara", "Tauramena", "Trinidad", "Villanueva", "Yopal"],
  "Cauca": ["Almaguer", "Argelia", "Balboa", "Bolívar", "Buenos Aires", "Cajibío", "Caldono", "Caloto", "Corinto", "El Tambo", "Florencia", "Guapi", "Inzá", "Jambalo", "La Sierra", "La Vega", "Lopez", "Mercaderes", "Miranda", "Morales", "Padilla", "Paez", "Patia", "Piamonte", "Piendamo", "Popayán", "Puerto Tejada", "Purace", "Rosas", "San Sebastian", "Santa Rosa", "Santander De Quilichao", "Silvia", "Sotara", "Suarez", "Sucre", "Timbio", "Timbiqui", "Toribio", "Totoro", "Villa Rica"],
  "Cesar": ["Aguachica", "Agustín Codazzi", "Astrea", "Becerril", "Bosconia", "Chimichagua", "Chiriguana", "Curumaní", "El Copey", "El Paso", "Gamarra", "González", "La Gloria", "La Jagua De Ibirico", "La Paz", "Manaure", "Pailitas", "Pelaya", "Pueblo Bello", "Río De Oro", "San Alberto", "San Diego", "San Martín", "Tamalameque", "Valledupar"],
  "Chocó": ["Acandí", "Alto Baudó", "Atrato", "Bagadó", "Bahía Solano", "Bajo Baudó", "Belén De Bajira", "Bojaya", "Canton De San Pablo", "Carmén Del Darién", "Certegui", "Condoto", "El Carmen De Atrato", "El Litoral Del San Juan", "Itsmina", "Juradó", "Lloró", "Medio Atrato", "Medio Baudó", "Medio San Juan", "Nóvita", "Nuquí", "Quibdó", "Río Frío", "Rio Quito", "Riosucio", "San José Del Palmar", "Sipí", "Tadó", "Unguía", "Union Panamericana"],
  "Córdoba": ["Ayapel", "Buenavista", "Canalete", "Cereté", "Chimá", "Chinú", "Ciénaga De Oro", "Cotorra", "La Apartada", "Lorica", "Los Córdobas", "Momil", "Montelíbano", "Montería", "Moñitos", "Planeta Rica", "Pueblo Nuevo", "Puerto Escondido", "Puerto Libertador", "Purísima", "Sahagún", "San Andrés Sotavento", "San Antero", "San Bernardo Del Viento", "San Carlos", "San Pelayo", "Tierralta", "Valencia"],
  "Cundinamarca": ["Agua De Dios", "Albán", "Anapoima", "Anolaima", "Apulo", "Arbeláez", "Beltrán", "Bituima", "Bogota D.C.", "Bojacá", "Cabrera", "Cachipay", "Cajicá", "Caparrapí", "Caqueza", "Carmen De Carupa", "Chaguaní", "Chía", "Chipaque", "Choachí", "Chocontá", "Cogua", "Cota", "Cucunubá", "El Colegio", "El Peñón", "El Rosal", "Facatativá", "Fomeque", "Fosca", "Funza", "Fúquene", "Fusagasugá", "Gachala", "Gachancipá", "Gacheta", "Gama", "Girardot", "Granada", "Guachetá", "Guaduas", "Guasca", "Guataquí", "Guatavita", "Guayabal De Siquima", "Guayabetal", "Gutiérrez", "Jerusalén", "Junín", "La Calera", "La Mesa", "La Palma", "La Peña", "La Vega", "Lenguazaque", "Macheta", "Madrid", "Manta", "Medina", "Mosquera", "Nariño", "Nemocon", "Nilo", "Nimaima", "Nocaima", "Pacho", "Paime", "Pandi", "Paratebueno", "Pasca", "Puerto Salgar", "Puli", "Quebradanegra", "Quetame", "Quipile", "Ricaurte", "San Antonio De Tequendama", "San Bernardo", "San Cayetano", "San Francisco", "San Juan De Río Seco", "Sasaima", "Sesquilé", "Sibaté", "Silvania", "Simijaca", "Soacha", "Sopó", "Subachoque", "Suesca", "Supatá", "Susa", "Sutatausa", "Tabio", "Tausa", "Tena", "Tenjo", "Tibacuy", "Tibirita", "Tocaima", "Tocancipá", "Topaipi", "Ubalá", "Ubaque", "Ubate", "Une", "Útica", "Venecia", "Vergara", "Vianí", "Villagomez", "Villapinzón", "Villeta", "Viotá", "Yacopí", "Zipacon", "Zipaquirá"],
  "Guainía": ["Barranco Mina", "Cacahual", "Inírida", "La Guadalupe", "Mapiripan", "Morichal", "Pana Pana", "Puerto Colombia", "San Felipe"],
  "Guaviare": ["Calamar", "El Retorno", "Miraflores", "San José Del Guaviare"],
  "Huila": ["Acevedo", "Agrado", "Aipe", "Algeciras", "Altamira", "Baraya", "Campoalegre", "Colombia", "Elías", "Garzón", "Gigante", "Guadalupe", "Hobo", "Iquira", "Isnos", "La Argentina", "La Plata", "Nátaga", "Neiva", "Oporapa", "Paicol", "Palermo", "Palestina", "Pital", "Pitalito", "Rivera", "Saladoblanco", "San Agustín", "Santa María", "Suaza", "Tarqui", "Tello", "Teruel", "Tesalia", "Timaná", "Villavieja", "Yaguará"],
  "La Guajira": ["Albania", "Barrancas", "Dibulla", "Distraccion", "El Molino", "Fonseca", "Hatonuevo", "La Jagua Del Pilar", "Maicao", "Manaure", "Riohacha", "San Juan Del Cesar", "Uribia", "Urumita", "Villanueva"],
  "Magdalena": ["Algarrobo", "Aracataca", "Ariguaní", "Cerro San Antonio", "Chibolo", "Ciénaga", "Concordia", "El Banco", "El Piñon", "El Reten", "Fundacion", "Guamal", "Nueva Granada", "Pedraza", "Pijiño Del Carmen", "Pivijay", "Plato", "Pueblo Viejo", "Remolino", "Sabanas De San Angel", "Salamina", "San Sebastian De Buenavista", "San Zenon", "Santa Ana", "Santa Barbara De Pinto", "Santa Marta", "Sitionuevo", "Tenerife", "Zapayan", "Zona Bananera"],
  "Meta": ["Acacias", "Barranca De Upia", "Cabuyaro", "Castilla La Nueva", "Cumaral", "El Calvario", "El Castillo", "El Dorado", "Fuente De Oro", "Granada", "Guamal", "La Macarena", "La Uribe", "Lejanías", "Mapiripan", "Mesetas", "Puerto Concordia", "Puerto Gaitán", "Puerto Lleras", "Puerto Lopez", "Puerto Rico", "Restrepo", "San Carlos Guaroa", "San Juan De Arama", "San Juanito", "San Luis De Cubarral", "San Martín", "Villavicencio", "Vista Hermosa"],
  "Nariño": ["Alban", "Aldana", "Ancuya", "Arboleda", "Barbacoas", "Belen", "Buesaco", "Chachagui", "Colon", "Consaca", "Contadero", "Córdoba", "Cuaspud", "Cumbal", "Cumbitara", "El Charco", "El Peñol", "El Rosario", "El Tablon De Gomez", "El Tambo", "Francisco Pizarro", "Funes", "Guachucal", "Guaitarilla", "Gualmatan", "Iles", "Imues", "Ipiales", "La Cruz", "La Florida", "La Llanada", "La Tola", "La Union", "Leiva", "Linares", "Los Andes", "Magui", "Mallama", "Mosquera", "Nariño", "Olaya Herrera", "Ospina", "Pasto", "Policarpa", "Potosí", "Providencia", "Puerres", "Pupiales", "Ricaurte", "Roberto Payan", "Samaniego", "San Bernardo", "San Lorenzo", "San Pablo", "San Pedro De Cartago", "Sandoná", "Santa Barbara", "Santa Cruz", "Sapuyes", "Taminango", "Tangua", "Tumaco", "Tuquerres", "Yacuanquer"],
  "Norte de Santander": ["Abrego", "Arboledas", "Bochalema", "Bucarasica", "Cachirá", "Cácota", "Chinácota", "Chitagá", "Convención", "Cúcuta", "Cucutilla", "Durania", "El Carmen", "El Tarra", "El Zulia", "Gramalote", "Hacarí", "Herrán", "La Esperanza", "La Playa", "Labateca", "Los Patios", "Lourdes", "Mutiscua", "Ocaña", "Pamplona", "Pamplonita", "Puerto Santander", "Ragonvalia", "Salazar", "San Calixto", "San Cayetano", "Santiago", "Sardinata", "Silos", "Teorama", "Tibú", "Toledo", "Villa Caro", "Villa Del Rosario"],
  "Putumayo": ["Colón", "Mocoa", "Orito", "Puerto Asis", "Puerto Caicedo", "Puerto Guzman", "Puerto Leguizamo", "San Francisco", "San Miguel", "Santiago", "Sibundoy", "Valle Del Guamuez", "Villa Garzon"],
  "Quindío": ["Armenia", "Buenavista", "Calarca", "Circasia", "Cordoba", "Filandia", "Genova", "La Tebaida", "Montengro", "Pijao", "Quimbaya", "Salento"],
  "Risaralda": ["Apía", "Balboa", "Belén De Umbría", "Dosquebradas", "Guática", "La Celia", "La Virginia", "Marsella", "Mistrató", "Pereira", "Pueblo Rico", "Quinchia", "Santa Rosa De Cabal", "Santuario"],
  "San Andrés y Providencia": ["Providencia Y Santa Catalina", "San Andres"],
  "Santander": ["Aguada", "Albania", "Aratoca", "Barbosa", "Barichara", "Barrancabermeja", "Betulia", "Bolívar", "Bucaramanga", "Cabrera", "California", "Capitanejo", "Carcasí", "Cepitá", "Cerrito", "Charalá", "Charta", "Chima", "Chipatá", "Cimitarra", "Concepción", "Confines", "Contratación", "Coromoro", "Curití", "El Carmen De Chucurí", "El Guacamayo", "El Peñón", "El Playón", "Encino", "Enciso", "Florián", "Floridablanca", "Galán", "Gambita", "Girón", "Guaca", "Guadalupe", "Guapotá", "Guavatá", "Guepsa", "Hato", "Jesús María", "Jordán", "La Belleza", "La Paz", "Landázuri", "Lebríja", "Los Santos", "Macaravita", "Málaga", "Matanza", "Mogotes", "Molagavita", "Ocamonte", "Oiba", "Onzaga", "Palmar", "Palmas Del Socorro", "Páramo", "Piedecuesta", "Pinchote", "Puente Nacional", "Puerto Parra", "Puerto Wilches", "Rionegro", "Sabana De Torres", "San Andrés", "San Benito", "San Gil", "San Joaquín", "San José De Miranda", "San Miguel", "San Vicente De Chucurí", "Santa Bárbara", "Santa Helena Del Opón", "Simacota", "Socorro", "Suaita", "Sucre", "Surata", "Tona", "Valle De San José", "Vélez", "Vetas", "Villanueva", "Zapatoca"],
  "Sucre": ["Buenavista", "Caimito", "Chalán", "Coloso", "Corozal", "Coveñas", "El Roble", "Galeras", "Guaranda", "La Unión", "Los Palmitos", "Majagual", "Morroa", "Ovejas", "Palmito", "Sampués", "San Benito Abad", "San Juan Betulia", "San Marcos", "San Onofre", "San Pedro", "Santiago De Tolú", "Sincé", "Sincelejo", "Sucre", "Tolú Viejo"],
  "Tolima": ["Alpujarra", "Alvarado", "Ambalema", "Anzoátegui", "Armero", "Ataco", "Cajamarca", "Carmen De Apicalá", "Casabianca", "Chaparral", "Coello", "Coyaima", "Cunday", "Dolores", "Espinal", "Falan", "Flandes", "Fresno", "Guamo", "Herveo", "Honda", "Ibague", "Icononzo", "Lerida", "Libano", "Mariquita", "Melgar", "Murillo", "Natagaima", "Ortega", "Palocabildo", "Piedras", "Planadas", "Prado", "Purificación", "Rioblanco", "Roncesvalles", "Rovira", "Saldaña", "San Antonio", "San Luis", "Santa Isabel", "Suárez", "Valle De San Juan", "Venadillo", "Villahermosa", "Villarrica"],
  "Valle del Cauca": ["Alcala", "Andalucía", "Ansermanuevo", "Argelia", "Bolívar", "Buenaventura", "Buga", "Bugalagrande", "Caicedonia", "Cali", "Calima", "Candelaria", "Cartago", "Dagua", "El Águila", "El Cairo", "El Cerrito", "El Dovio", "Florida", "Ginebra", "Guacarí", "Jamundí", "La Cumbre", "La Unión", "La Victoria", "Obando", "Palmira", "Pradera", "Restrepo", "Riofrio", "Roldanillo", "San Pedro", "Sevilla", "Toro", "Trujillo", "Tuluá", "Ulloa", "Versalles", "Vijes", "Yotoco", "Yumbo", "Zarzal"],
  "Vaupés": ["Caruru", "Mitú", "Pacoa", "Papunahua", "Taraira", "Yavaraté"],
  "Vichada": ["Cumaribo", "La Primavera", "Puerto Carreño", "Santa Rosalía"],
};

const sinAcentos = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

/**
 * Encuentra el departamento + nombre canónico de ciudad para un texto libre
 * (comparando sin acentos/mayúsculas) — para prellenar "departamento/ciudad
 * origen" a partir de `user_profiles.ciudad` (ver `ciudadDefault` en
 * servicios-tabla.tsx), que es un campo de texto libre sin departamento
 * asociado. Devuelve null si no hay match en el catálogo real.
 */
export function resolverCiudad(ciudad: string | null | undefined): { departamento: string; ciudad: string } | null {
  if (!ciudad?.trim()) return null;
  const objetivo = sinAcentos(ciudad);
  // Caso especial: quien escribe su ciudad en el perfil casi nunca pone
  // "Bogotá D.C." completo — "Bogota"/"Bogotá" alcanza para reconocerla,
  // a diferencia del resto de ciudades donde sí se exige coincidencia exacta.
  if (objetivo === "bogota" || objetivo.startsWith("bogota ")) {
    return { departamento: "Bogotá D.C.", ciudad: "Bogotá D.C." };
  }
  for (const [departamento, ciudades] of Object.entries(MUNICIPIOS_POR_DEPARTAMENTO)) {
    const match = ciudades.find((c) => sinAcentos(c) === objetivo);
    if (match) return { departamento, ciudad: match };
  }
  return null;
}
