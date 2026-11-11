/* ============================================================
   CONMUTADOR · línea de tiempo de Gestión de Redes
   ============================================================ */
'use strict';

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const h  = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

const CATS = {
  arch: { name: 'Arquitectura', color: 'var(--blue)'  },
  serv: { name: 'Servicios',    color: 'var(--ochre)' },
  seg:  { name: 'Seguridad',    color: 'var(--plum)'  },
  gest: { name: 'Gestión',      color: 'var(--green)' },
};

/* ============================================================
   DATOS
   ============================================================ */
const TOPICS = [
{
  id: 1, year: 1984, cat: 'arch', votes: 1,
  origin: 'ISO 7498 · Modelo de referencia OSI',
  title: 'Modelado OSI/TCP-IP y dependencias de servicios',
  short: 'Siete capas para entender por qué un servicio cae… y quién lo arrastra.',
  summary: 'El modelo <strong>OSI</strong> divide la comunicación en siete capas con responsabilidades independientes; <strong>TCP/IP</strong>, nacido antes y más pragmático, las colapsa en cuatro. Modelar un servicio significa trazar su <strong>cadena de dependencias</strong>: una web depende de DNS, que depende de IP, que depende de un enlace, que depende de un medio físico.',
  points: [
    '<b>Encapsulado:</b> cada capa añade su cabecera al bajar y la quita al subir.',
    '<b>Dependencia vertical:</b> un fallo en una capa baja se propaga hacia arriba, pero no al revés.',
    '<b>Diagnóstico por capas:</b> de abajo hacia arriba (¿hay luz? ¿hay IP? ¿resuelve DNS? ¿responde la app?).',
    '<b>OSI vs TCP/IP:</b> OSI es el vocabulario común; TCP/IP es lo que realmente corre en Internet.',
  ],
  miles: [[1974,'Cerf y Kahn publican el diseño de TCP.'],[1981,'RFC 791 y 793 definen IP y TCP.'],[1983,'ARPANET migra oficialmente a TCP/IP (1 de enero).',1],[1984,'ISO publica el estándar 7498: modelo OSI de 7 capas.',1],[1988,'ITU-T adopta el modelo como X.200.']],
  refs: ['ISO/IEC 7498-1','ITU-T X.200','RFC 791 · IP','RFC 793 · TCP','RFC 1122'],
  demo: { tabs: [
    { label: 'Pila OSI', kind: 'layers', animate: true,
      intro: 'Pulsa <b>Enviar mensaje</b> para ver cómo se encapsula hacia abajo y se desencapsula en el destino. Toca cada capa para ver su papel.',
      items: [
        { k:'7', n:'Aplicación', p:'Datos', t:'HTTP · SMTP · DNS', hdr:'data', m:'Aplicación', d:'Interfaz entre la red y el software de usuario: define el protocolo que habla la aplicación.', x:'Ping responde pero la página no carga → el fallo vive aquí.' },
        { k:'6', n:'Presentación', p:'Datos', t:'ASN.1 · TLS · JPEG', m:'Aplicación', d:'Sintaxis común: codificación, compresión y cifrado. Aquí vive ASN.1, la base de las MIB de SNMP.', x:'Certificado con formato inválido: la conexión se establece pero no se entiende.' },
        { k:'5', n:'Sesión', p:'Datos', t:'RPC · SIP · NetBIOS', m:'Aplicación', d:'Abre, mantiene y cierra diálogos entre aplicaciones; puntos de sincronización.', x:'Una videollamada se corta a mitad: la sesión expiró, no la red.' },
        { k:'4', n:'Transporte', p:'Segmento', t:'TCP · UDP', hdr:'tcp', m:'Transporte', d:'Entrega extremo a extremo: puertos, control de flujo, retransmisión y congestión.', x:'Un firewall que bloquea el puerto 443 rompe el servicio aunque la IP sea alcanzable.' },
        { k:'3', n:'Red', p:'Paquete', t:'IP · ICMP · OSPF', hdr:'ip', m:'Internet', d:'Direccionamiento lógico y enrutamiento entre redes distintas.', x:'Ruta incorrecta: el enlace está arriba pero el destino es inalcanzable.' },
        { k:'2', n:'Enlace de datos', p:'Trama', t:'Ethernet · Wi-Fi · ARP', hdr:'eth', m:'Acceso a red', d:'Entrega salto a salto en un mismo segmento; direcciones MAC y detección de errores.', x:'Un bucle de capa 2 (sin STP) satura todo el segmento en segundos.' },
        { k:'1', n:'Física', p:'Bits', t:'UTP · Fibra · RF', hdr:'bits', m:'Acceso a red', d:'Señales eléctricas, ópticas o de radio sobre el medio.', x:'Un cable cortado hunde todo lo que está encima.' },
      ] },
    { label: 'Dependencias', kind: 'compare',
      intro: 'Modelar dependencias es responder: <b>«si esto falla, ¿qué deja de funcionar y qué sigue vivo?»</b>',
      cols: ['Si falla…','Síntoma','Sigue funcionando','Dependencia rota'],
      rows: [
        ['Cable / puerto (L1)','Sin enlace, nada responde','Nada de la ruta afectada','Todo lo superior'],
        ['Enrutamiento (L3)','Red remota inalcanzable','Hosts del mismo segmento','TCP, DNS remoto, web'],
        ['DNS (L7)','«El sitio no existe»','Ping a la IP directa','Resolución de nombres'],
        ['Puerto filtrado (L4)','Timeout al conectar','Ping (ICMP)','Servicios TCP/UDP concretos'],
        ['Aplicación (L7)','Error 500 / conexión rechazada','Toda la red','Solo el servicio'],
      ] },
  ] },
},
{
  id: 2, year: 1983, cat: 'serv', votes: 1,
  origin: 'RFC 882/883 · nace el DNS',
  title: 'Servicios esenciales de red: DHCP y DNS',
  short: 'Dos servicios invisibles sin los que ningún equipo sabe quién es ni a dónde ir.',
  summary: '<strong>DHCP</strong> entrega a cada equipo su dirección IP, máscara, puerta de enlace y servidores DNS de forma automática. <strong>DNS</strong> traduce nombres legibles a direcciones IP mediante una jerarquía distribuida. Si uno falla, el usuario percibe «no hay Internet» aunque el enlace esté perfecto.',
  points: [
    '<b>DHCP usa UDP 67/68</b> y un proceso de 4 pasos conocido como DORA, con <b>concesión (lease)</b> renovable.',
    '<b>DNS es jerárquico:</b> raíz → TLD (.com) → servidor autoritativo; los resolvers cachean según el <b>TTL</b>.',
    '<b>Registros clave:</b> A, AAAA, CNAME, MX, NS, PTR, TXT.',
    '<b>Gestión:</b> monitorear agotamiento de pool DHCP, latencia de resolución y tasa de NXDOMAIN.',
  ],
  miles: [[1983,'Paul Mockapetris diseña el DNS (RFC 882/883).',1],[1985,'BOOTP, antecesor de DHCP (RFC 951).'],[1987,'DNS se estandariza en RFC 1034/1035.'],[1993,'Primer DHCP (RFC 1531); revisado en RFC 2131 (1997).',1],[2005,'DNSSEC añade firmas digitales (RFC 4033-4035).'],[2018,'DNS sobre HTTPS (RFC 8484) cifra la consulta.']],
  refs: ['RFC 1034/1035 · DNS','RFC 2131 · DHCP','RFC 4033 · DNSSEC','RFC 8484 · DoH'],
  demo: { tabs: [
    { label: 'DHCP · DORA', kind: 'sequence', actors: ['Cliente','Servidor DHCP'],
      intro: 'Un equipo recién conectado no tiene IP: debe <b>pedirla a gritos</b> por broadcast.',
      steps: [
        { f:0,t:1,l:'DISCOVER',n:'<span class="ph">Descubrir</span>El cliente hace <code>broadcast 255.255.255.255</code> (UDP 68→67): «¿hay algún servidor DHCP?».' },
        { f:1,t:0,l:'OFFER · 192.168.1.50',n:'<span class="ph">Ofrecer</span>El servidor reserva temporalmente <code>192.168.1.50/24</code> y propone también gateway, DNS y tiempo de concesión.' },
        { f:0,t:1,l:'REQUEST · 192.168.1.50',n:'<span class="ph">Solicitar</span>El cliente acepta una oferta. Sigue en broadcast para avisar a otros servidores que declina sus ofertas.' },
        { f:1,t:0,l:'ACK · lease 8 h',n:'<span class="ph">Confirmar</span>El servidor confirma. A la mitad del lease (T1 = 4 h) el cliente intentará <b>renovar</b> por unicast.' },
      ] },
    { label: 'DNS · resolución', kind: 'sequence', actors: ['Cliente','Resolver','Raíz','TLD .com','Autoritativo'],
      intro: 'Resolver <code>www.ejemplo.com</code> sin caché: una consulta <b>recursiva</b> del cliente, varias <b>iterativas</b> del resolver.',
      steps: [
        { f:0,t:1,l:'A www.ejemplo.com?',n:'<span class="ph">Recursiva</span>El cliente pregunta a su resolver (DHCP se lo entregó) y espera la respuesta final.' },
        { f:1,t:2,l:'¿.com?',n:'<span class="ph">Iterativa 1</span>El resolver pregunta a uno de los 13 grupos de servidores raíz.' },
        { f:2,t:1,l:'NS de .com',n:'<span class="ph">Referencia</span>La raíz no sabe la IP, pero sabe quién gestiona <code>.com</code>.' },
        { f:1,t:3,l:'¿ejemplo.com?',n:'<span class="ph">Iterativa 2</span>Consulta al servidor TLD.' },
        { f:3,t:1,l:'NS ns1.ejemplo.com',n:'<span class="ph">Referencia</span>El TLD señala el servidor autoritativo del dominio.' },
        { f:1,t:4,l:'A www?',n:'<span class="ph">Iterativa 3</span>Pregunta al que tiene la verdad.' },
        { f:4,t:1,l:'203.0.113.10 · TTL 300',n:'<span class="ph">Respuesta autoritativa</span>El resolver cachea el resultado durante 300 s.' },
        { f:1,t:0,l:'203.0.113.10',n:'<span class="ph">Fin</span>El cliente recibe la IP. La siguiente consulta en 5 min sale directo de la caché: 0 saltos.' },
      ] },
  ] },
},
{
  id: 3, year: 1982, cat: 'serv', votes: 2,
  origin: 'RFC 821 · SMTP',
  title: 'Servicios de aplicación web y mensajería',
  short: 'HTTP, SMTP, POP e IMAP: el diálogo de texto que sostiene la web y el correo.',
  summary: 'Son protocolos de <strong>capa de aplicación</strong> basados en un diálogo de petición y respuesta, muchos legibles como texto. <strong>HTTP</strong> transporta la web; <strong>SMTP</strong> envía correo entre servidores; <strong>POP3</strong> e <strong>IMAP</strong> permiten al usuario recibirlo: POP3 descarga, IMAP sincroniza.',
  points: [
    '<b>HTTP es sin estado:</b> cada petición es independiente (cookies y tokens añaden la sesión).',
    '<b>SMTP empuja, IMAP/POP3 tiran:</b> enviar y recibir son protocolos distintos.',
    '<b>Códigos de estado:</b> HTTP 2xx/3xx/4xx/5xx; SMTP 2xx/4xx (temporal)/5xx (permanente).',
    '<b>Hoy todo va cifrado:</b> 443, 587/465, 993/995.',
  ],
  miles: [[1982,'SMTP definido en RFC 821.',1],[1988,'Primeras especificaciones de POP y IMAP.'],[1991,'HTTP/0.9: la web sale del CERN.',1],[1996,'HTTP/1.0 (RFC 1945); HTTP/1.1 llega en 1997.'],[2015,'HTTP/2 multiplexa en una sola conexión.'],[2022,'HTTP/3 corre sobre QUIC (UDP).']],
  refs: ['RFC 9110 · HTTP','RFC 5321 · SMTP','RFC 1939 · POP3','RFC 9051 · IMAP4rev2'],
  demo: { tabs: [
    { label: 'HTTP', kind: 'sequence', actors: ['Navegador','Servidor web'],
      intro: 'Cargar una página es una conversación corta de texto sobre TCP.',
      steps: [
        { f:0,t:1,l:'TCP SYN',n:'<span class="ph">Transporte</span>Se abre la conexión TCP al puerto 443 (o 80). Handshake de tres vías: SYN, SYN-ACK, ACK.' },
        { f:1,t:0,l:'SYN-ACK',n:'El servidor acepta y confirma. (Con HTTPS aquí sigue el handshake TLS).' },
        { f:0,t:1,l:'GET /index.html',n:'<span class="ph">Petición</span><code>GET /index.html HTTP/1.1</code> + cabecera <code>Host: ejemplo.com</code>. El método dice la intención.' },
        { f:1,t:0,l:'200 OK + HTML',n:'<span class="ph">Respuesta</span><code>HTTP/1.1 200 OK</code>, <code>Content-Type: text/html</code> y el cuerpo.' },
        { f:0,t:1,l:'GET /app.css',n:'<span class="ph">Keep-alive</span>El navegador reutiliza la misma conexión para pedir recursos adicionales.' },
      ] },
    { label: 'Ruta del correo', kind: 'sequence', actors: ['Remitente','MTA origen','MTA destino','Buzón'],
      intro: 'Un correo cruza dos servidores antes de llegar. Cada salto habla SMTP.',
      steps: [
        { f:0,t:1,l:'Envío · 587',n:'<span class="ph">Submission</span>El cliente entrega el mensaje a su servidor (puerto 587, autenticado).' },
        { f:1,t:1,l:'DNS: ¿MX de destino.com?',n:'<span class="ph">Búsqueda MX</span>El MTA consulta el registro <b>MX</b> del dominio destino (¡otra vez DNS!).' },
        { f:1,t:2,l:'HELO · MAIL FROM · RCPT TO · DATA',n:'<span class="ph">Relay · puerto 25</span><code>MAIL FROM:&lt;a@origen.com&gt;</code>, <code>RCPT TO:&lt;b@destino.com&gt;</code>, <code>DATA</code>, mensaje, y un punto solo en una línea.' },
        { f:2,t:3,l:'Entrega local',n:'<span class="ph">Entrega</span>El MTA destino deposita el mensaje en el buzón (Maildir/mbox).' },
        { f:3,t:3,l:'IMAP FETCH · 993',n:'<span class="ph">Lectura</span>El destinatario lo lee con IMAP: el mensaje sigue en el servidor, sincronizado entre dispositivos.' },
      ] },
    { label: 'Comparativa', kind: 'compare',
      cols: ['Protocolo','Puerto seguro','Rol','Modelo'],
      rows: [
        ['HTTP/HTTPS','80 / 443','Transferir recursos web','Petición-respuesta, sin estado'],
        ['SMTP','25 · 587 · 465','Enviar y retransmitir correo','Push entre servidores'],
        ['POP3','110 / 995','Recoger correo','Descarga y (normalmente) borra'],
        ['IMAP','143 / 993','Leer correo remoto','Sincroniza carpetas y estado'],
      ] },
  ] },
},
{
  id: 4, year: 1995, cat: 'seg', votes: 4,
  origin: 'SSH-1 · Tatu Ylönen',
  title: 'Criptografía en tránsito y administración remota segura: TLS 1.3 y SSH',
  short: 'Cómo dos extremos que no se conocen acuerdan un secreto en un canal hostil.',
  summary: 'Antes de SSH, <strong>telnet</strong> enviaba contraseñas en claro. SSH y TLS resuelven el mismo problema: acordar claves de sesión con <strong>intercambio Diffie-Hellman</strong>, autenticar a los participantes y cifrar todo el tráfico posterior. <strong>TLS 1.3</strong> redujo el handshake a un solo viaje y eliminó algoritmos débiles.',
  points: [
    '<b>Confidencialidad, integridad y autenticidad</b> con cifrado simétrico + AEAD (AES-GCM, ChaCha20-Poly1305).',
    '<b>Forward secrecy obligatoria en TLS 1.3:</b> robar la clave del servidor hoy no descifra sesiones pasadas.',
    '<b>SSH:</b> autenticación por clave pública, túneles y reenvío de puertos; sustituye a telnet, rsh y FTP.',
    '<b>Gestión:</b> inventario de certificados, rotación de claves y desactivar protocolos heredados.',
  ],
  miles: [[1995,'Tatu Ylönen crea SSH tras un ataque de sniffing en su universidad.',1],[1996,'SSL 3.0 (base de TLS).'],[1999,'TLS 1.0 (RFC 2246).'],[2006,'SSH-2 se estandariza (RFC 4251-4254).'],[2014,'Heartbleed sacude OpenSSL.'],[2018,'TLS 1.3 publicado como RFC 8446.',1]],
  refs: ['RFC 8446 · TLS 1.3','RFC 4251 · Arquitectura SSH','RFC 7748 · Curve25519','RFC 5246 · TLS 1.2'],
  demo: { tabs: [
    { label: 'TLS 1.3', kind: 'sequence', actors: ['Cliente','Servidor'],
      intro: 'El handshake completo cabe en <b>1 RTT</b>: el cliente adivina el algoritmo y manda su parte de la clave desde el primer mensaje.',
      steps: [
        { f:0,t:1,l:'ClientHello + key_share',n:'<span class="ph">Mensaje 1</span>Versiones, suites y la <b>clave pública efímera</b> del cliente (X25519). El cliente apuesta por una curva.' },
        { f:1,t:0,l:'ServerHello + key_share',n:'<span class="ph">Mensaje 2</span>El servidor elige parámetros y envía su clave efímera. Ambos ya pueden derivar la <b>clave del handshake</b>: todo lo siguiente va cifrado.' },
        { f:1,t:0,l:'{Certificate · Verify · Finished}',n:'<span class="ph">Autenticación (cifrada)</span>Certificado, firma sobre la transcripción y <code>Finished</code> (MAC de todo el handshake). Se oculta incluso la identidad del servidor.' },
        { f:0,t:1,l:'{Finished}',n:'<span class="ph">Mensaje 3</span>El cliente verifica el certificado y confirma. Ambos derivan las claves de tráfico.' },
        { f:0,t:1,l:'{Application Data}',n:'<span class="ph">Datos</span>Ya hay canal seguro. La petición HTTP puede ir en el mismo vuelo que el <code>Finished</code>.' },
      ] },
    { label: 'SSH-2', kind: 'sequence', actors: ['Cliente','Servidor'],
      intro: 'SSH separa tres capas: transporte (cifrado), autenticación de usuario y canales.',
      steps: [
        { f:0,t:1,l:'SSH-2.0-OpenSSH',n:'<span class="ph">Versión</span>Ambos extremos intercambian cadena de versión en texto plano.' },
        { f:0,t:1,l:'KEXINIT',n:'<span class="ph">Negociación</span>Listas de algoritmos de intercambio de claves, cifrado, MAC y clave de host.' },
        { f:1,t:0,l:'ECDH reply + firma host key',n:'<span class="ph">Intercambio</span>Curve25519 genera el secreto compartido; el servidor <b>firma el hash</b> con su clave de host. Primera vez: el cliente ve la huella y decide si confía (<code>known_hosts</code>).' },
        { f:0,t:1,l:'NEWKEYS',n:'<span class="ph">Cifrado activo</span>Desde aquí, todo el tráfico va cifrado y con integridad.' },
        { f:0,t:1,l:'userauth: publickey',n:'<span class="ph">Autenticación</span>El cliente prueba posesión de su clave privada firmando un reto. Sin contraseñas viajando.' },
        { f:1,t:0,l:'SUCCESS → channel session',n:'<span class="ph">Canal</span>Se abre un canal: shell, ejecución remota, SFTP o un túnel de puertos.' },
      ] },
    { label: 'TLS 1.2 vs 1.3', kind: 'compare',
      cols: ['Aspecto','TLS 1.2','TLS 1.3'],
      rows: [
        ['Viajes del handshake','2 RTT','1 RTT (0-RTT opcional)'],
        ['Intercambio de claves','RSA estático o (EC)DHE','Solo (EC)DHE → forward secrecy'],
        ['Cifrados','CBC, RC4, 3DES posibles','Solo AEAD (AES-GCM, ChaCha20)'],
        ['Certificado','Visible en claro','Cifrado'],
        ['Renegociación','Permitida (fuente de ataques)','Eliminada'],
      ] },
  ] },
},
{
  id: 5, year: 1992, cat: 'gest', votes: 3,
  origin: 'ITU-T M.3010 · primera edición',
  title: 'Arquitectura de gestión de redes de telecomunicaciones: TMN (UIT-T M.3010)',
  short: 'El plano arquitectónico con el que los operadores gestionan redes de cualquier fabricante.',
  summary: 'La <strong>TMN</strong> (Telecommunications Management Network) es una red <em>separada</em> y lógica que gestiona la red de telecomunicaciones. Su idea central es la <strong>arquitectura en capas lógicas</strong>: cada capa abstrae a la de abajo, permitiendo gestionar equipos de distintos fabricantes con interfaces estándar.',
  points: [
    '<b>Tres arquitecturas:</b> funcional (bloques), física (nodos) y de información (modelos de objetos gestionados).',
    '<b>Interfaces estándar:</b> Q3 entre sistemas de operaciones y elementos de red, X hacia otras TMN, F hacia estaciones de trabajo.',
    '<b>Separación de preocupaciones:</b> el negocio no necesita saber qué router hay debajo.',
    '<b>Legado:</b> alimentó a eTOM, a FCAPS en M.3400 y a los modelos de gestión actuales.',
  ],
  miles: [[1985,'El UIT-T inicia el trabajo de la serie M.30.'],[1992,'M.3010: se publica la arquitectura TMN.',1],[1996,'Revisión: se refina el modelo de capas.'],[2000,'Nueva versión alineada a principios de arquitectura de gestión.',1],[2004,'M.3050 adopta eTOM como marco de procesos.']],
  refs: ['ITU-T M.3010','ITU-T M.3100','ITU-T M.3400','ITU-T M.3050 · eTOM'],
  demo: { tabs: [
    { label: 'Capas lógicas', kind: 'layers',
      intro: 'Cada capa gestiona la inferior y sirve a la superior. Toca una para ver su alcance.',
      items: [
        { k:'BML', n:'Gestión del negocio', p:'Estrategia', t:'', d:'Objetivos corporativos, presupuestos y planes. Decide <em>qué</em> negocio se hace con la red.', x:'«Lanzar 5G en 12 ciudades este año con un 15 % de margen.»' },
        { k:'SML', n:'Gestión de servicios', p:'Contratos · SLA', t:'', d:'Relación con el cliente: aprovisionamiento, calidad percibida y acuerdos de nivel de servicio.', x:'Garantizar 99,95 % de disponibilidad a un cliente corporativo.' },
        { k:'NML', n:'Gestión de red', p:'Visión extremo a extremo', t:'', d:'Topología completa, rutas y capacidad a lo largo de múltiples elementos y tecnologías.', x:'Crear un circuito de extremo a extremo atravesando 6 nodos.' },
        { k:'EML', n:'Gestión de elementos', p:'EMS', t:'', d:'Gestiona cada equipo o grupo de equipos con su sistema (EMS) y abstrae al fabricante.', x:'El EMS del fabricante A configura sus DWDM.' },
        { k:'NEL', n:'Elementos de red', p:'Equipos', t:'', d:'Los equipos físicos: conmutadores, routers, multiplexores. Exponen un agente de gestión.', x:'Un router con agente SNMP/NETCONF reportando alarmas.' },
      ] },
    { label: 'Bloques funcionales', kind: 'compare',
      intro: 'La arquitectura funcional describe <b>qué hace cada bloque</b> y los puntos de referencia donde se conectan.',
      cols: ['Bloque','Función','Se conecta mediante'],
      rows: [
        ['OSF','Operations System Function · procesa la información de gestión','q3, x'],
        ['NEF','Network Element Function · el equipo gestionado','q3 / qx'],
        ['MF','Mediation Function · adapta interfaces distintas','qx'],
        ['QAF','Q Adapter Function · integra equipos no TMN','q3'],
        ['WSF','Workstation Function · interfaz con el operador','f'],
      ] },
  ] },
},
{
  id: 6, year: 1997, cat: 'gest', votes: 2,
  origin: 'ITU-T M.3400 · funciones de gestión TMN',
  title: 'Modelo funcional FCAPS y operación de un NOC (UIT-T M.3400)',
  short: 'Cinco letras que ordenan todo lo que un operador debe poder hacer con una red.',
  summary: '<strong>FCAPS</strong> clasifica las funciones de gestión en cinco áreas: Fallas, Configuración, Contabilidad, Desempeño y Seguridad. El <strong>NOC</strong> (Network Operations Center) es el equipo y el lugar donde esas funciones se ejecutan 24×7, con procesos de escalado y herramientas de observabilidad.',
  points: [
    '<b>Origen:</b> ISO lo propuso en el marco de gestión OSI (ISO 7498-4); M.3400 lo adapta a TMN.',
    '<b>Un NOC no es un monitor:</b> es detección, correlación, diagnóstico, escalado y comunicación.',
    '<b>Métricas:</b> MTTD, MTTR, disponibilidad, % de incidentes repetidos.',
    '<b>Niveles de soporte:</b> N1 (triage), N2 (diagnóstico), N3 (ingeniería y causa raíz).',
  ],
  miles: [[1989,'ISO 7498-4 define las áreas funcionales de gestión OSI.',1],[1992,'TMN reutiliza el esquema en M.3010.'],[1997,'M.3400 describe las funciones de gestión de TMN.',1],[2000,'Edición revisada de M.3400.'],[2010,'Los NOC incorporan correlación de eventos y automatización.']],
  refs: ['ITU-T M.3400','ISO/IEC 7498-4','ITU-T X.700'],
  demo: { tabs: [
    { label: 'FCAPS', kind: 'layers',
      intro: 'Cada letra es un <b>frente de trabajo</b> con sus propias herramientas.',
      items: [
        { k:'F', n:'Fault · Fallas', p:'Detectar y resolver', t:'Traps · syslog · alarmas', d:'Detección, localización, correlación y corrección de eventos anormales.', x:'Una caída de interfaz genera un trap SNMP linkDown que el NMS correlaciona.' },
        { k:'C', n:'Configuration · Configuración', p:'Cambiar y respaldar', t:'NETCONF · Ansible', d:'Inventario, aprovisionamiento, versiones y respaldo de configuraciones.', x:'Un cambio de VLAN se aplica a 200 switches y se guarda en control de versiones.' },
        { k:'A', n:'Accounting · Contabilidad', p:'Medir y facturar', t:'NetFlow · IPFIX · CDR', d:'Uso de recursos por usuario o servicio: facturación y reparto de costes.', x:'Facturar por GB transferido o por minuto de voz.' },
        { k:'P', n:'Performance · Desempeño', p:'Medir y optimizar', t:'SNMP polling · telemetría', d:'Latencia, jitter, pérdida, utilización; tendencias y planificación de capacidad.', x:'Un enlace al 85 % durante semanas dispara una ampliación.' },
        { k:'S', n:'Security · Seguridad', p:'Proteger', t:'AAA · ACL · SNMPv3', d:'Control de acceso, autenticación, registro de auditoría y detección de amenazas.', x:'Rotación de credenciales y cifrado de la gestión.' },
      ] },
    { label: 'Incidente en el NOC', kind: 'sequence', actors: ['Monitoreo','NOC N1','NOC N2','Ingeniería N3','Cliente'],
      intro: 'El ciclo de vida de una alarma, de la detección al cierre.',
      steps: [
        { f:0,t:1,l:'Alarma crítica',n:'<span class="ph">Detección</span>Las alarmas redundantes se correlacionan en un único incidente para evitar tormentas.' },
        { f:1,t:4,l:'Aviso proactivo',n:'<span class="ph">Comunicación</span>N1 clasifica la severidad y avisa al cliente antes de que llame.' },
        { f:1,t:2,l:'Escala (> 15 min)',n:'<span class="ph">Escalado</span>Sin resolución en el tiempo objetivo, pasa a N2 con evidencias y diagnósticos ya hechos.' },
        { f:2,t:3,l:'Causa raíz',n:'<span class="ph">Ingeniería</span>N3 analiza el origen (p. ej. fallo de firmware) y aplica la corrección definitiva.' },
        { f:3,t:4,l:'Cierre + RCA',n:'<span class="ph">Cierre</span>Informe de causa raíz, acciones preventivas y actualización de la base de conocimiento.' },
      ] },
  ] },
},
{
  id: 7, year: 1988, cat: 'gest', votes: 2,
  origin: 'RFC 1065 · SMI y MIB-I',
  title: 'Estructuras de información de gestión: MIB, OID, ASN.1/SMI y SNMPv2c',
  short: 'El diccionario universal con el que un NMS pregunta cualquier cosa a cualquier equipo.',
  summary: 'Una <strong>MIB</strong> es un diccionario jerárquico de objetos gestionables. Cada objeto tiene un <strong>OID</strong> único en un árbol mundial. Se definen con <strong>SMI</strong>, un subconjunto de <strong>ASN.1</strong>. <strong>SNMPv2c</strong> añadió GetBulk, Inform y contadores de 64 bits, pero conservó la seguridad por «comunidad» en texto claro.',
  points: [
    '<b>OID:</b> secuencia de enteros como <code>1.3.6.1.2.1.1.5.0</code> → sysName.0.',
    '<b>Objetos escalares</b> terminan en <code>.0</code>; las <b>tablas</b> añaden un índice (p. ej. ifDescr.<em>2</em>).',
    '<b>SMIv2</b> añade Counter64, MODULE-IDENTITY y mejores definiciones.',
    '<b>v2c:</b> operaciones GetBulk e Inform, pero la comunidad viaja sin cifrar.',
  ],
  miles: [[1984,'ASN.1 empieza a definirse (X.409).'],[1988,'RFC 1065/1066: SMI y MIB-I. SNMPv1 (RFC 1067).',1],[1990,'RFC 1155: SMIv1.'],[1991,'MIB-II (RFC 1213) se vuelve la base universal.',1],[1996,'SNMPv2c (RFC 1901): GetBulk, Inform, Counter64.'],[1999,'SMIv2 estándar (RFC 2578).']],
  refs: ['RFC 1213 · MIB-II','RFC 2578 · SMIv2','RFC 1901 · SNMPv2c','ITU-T X.690 · BER'],
  demo: { tabs: [
    { label: 'Árbol OID', kind: 'tree',
      intro: 'Navega el árbol real: toca un nodo para ver su OID y expándelo para bajar.' },
    { label: 'Definición ASN.1', kind: 'code',
      intro: 'Así se define un objeto en una MIB (SMIv2): <b>tipo, acceso, estado y posición en el árbol</b>.',
      text: `-- Fragmento de SNMPv2-MIB
sysName OBJECT-TYPE
    SYNTAX      DisplayString (SIZE (0..255))
    MAX-ACCESS  read-write
    STATUS      current
    DESCRIPTION
        "Nombre administrativo del nodo.
         Por convención, su FQDN."
    ::= { system 5 }
-- system = 1.3.6.1.2.1.1
-- OID final: 1.3.6.1.2.1.1.5` },
    { label: 'Operaciones v2c', kind: 'sequence', actors: ['Gestor (NMS)','Agente SNMP'],
      intro: 'SNMPv2c sobre UDP 161/162. La «seguridad» es solo la cadena de comunidad.',
      steps: [
        { f:0,t:1,l:'GetRequest sysName.0 · «public»',n:'<span class="ph">Get</span>Pide el valor de un OID concreto, enviando la <b>comunidad</b> como contraseña, en texto claro.' },
        { f:1,t:0,l:'Response · «router-core-01»',n:'<span class="ph">Response</span>El agente devuelve el valor con su tipo ASN.1 (OCTET STRING).' },
        { f:0,t:1,l:'GetBulkRequest ifTable',n:'<span class="ph">GetBulk</span>Novedad de v2c: recupera muchas filas de una tabla en una sola petición.' },
        { f:1,t:0,l:'InformRequest · linkDown',n:'<span class="ph">Inform</span>Notificación <b>con confirmación</b> (a diferencia del Trap). Va al puerto 162.' },
        { f:0,t:1,l:'Response (ack)',n:'<span class="ph">Ack</span>El gestor confirma: el agente sabe que el evento llegó.' },
      ] },
  ] },
},
{
  id: 8, year: 1998, cat: 'seg', votes: 4,
  origin: 'RFC 2271 · primera arquitectura SNMPv3',
  title: 'Seguridad en gestión de red (SNMPv3) y estándares RFC de monitoreo',
  short: 'SNMP deja de ser «public» y gana usuarios, autenticación y cifrado.',
  summary: '<strong>SNMPv3</strong> no cambia las operaciones, cambia la <strong>seguridad</strong>: usuarios con el modelo <strong>USM</strong>, autenticación con HMAC-SHA, privacidad con AES y control de acceso por vistas (<strong>VACM</strong>). Se complementa con un ecosistema de RFC de monitoreo: RMON, IF-MIB, IPFIX, syslog.',
  points: [
    '<b>Tres niveles:</b> noAuthNoPriv, authNoPriv y authPriv.',
    '<b>Protección contra repeticiones:</b> engineID, engineBoots y engineTime.',
    '<b>VACM:</b> cada usuario ve solo las ramas del árbol que le corresponden.',
    '<b>Buenas prácticas:</b> usar authPriv, desactivar v1/v2c y rotar claves.',
  ],
  miles: [[1988,'SNMPv1: seguridad por comunidad.'],[1995,'RMON1 (RFC 1757) estandariza el monitoreo remoto.'],[1998,'RFC 2271-2275: primera versión de SNMPv3.',1],[2002,'RFC 3411-3418 (STD 62): SNMPv3 estándar.',1],[2004,'AES para USM (RFC 3826).'],[2013,'IPFIX (RFC 7011) estandariza el flujo de tráfico.']],
  refs: ['RFC 3411-3418 · STD 62','RFC 3414 · USM','RFC 3415 · VACM','RFC 2819 · RMON','RFC 2863 · IF-MIB','RFC 5424 · Syslog','RFC 7011 · IPFIX'],
  demo: { tabs: [
    { label: 'Niveles de seguridad', kind: 'compare',
      intro: 'El nivel se configura por usuario. Los cambios de v1/v2c a v3 son sobre todo de <b>seguridad</b>.',
      cols: ['Nivel','Autenticación','Integridad','Cifrado'],
      rows: [
        ['SNMPv1 / v2c','Comunidad (texto claro)','✗','✗'],
        ['noAuthNoPriv','Solo nombre de usuario','✗','✗'],
        ['authNoPriv','Usuario + HMAC-SHA','✓','✗'],
        ['authPriv','Usuario + HMAC-SHA','✓','✓ AES-128'],
      ] },
    { label: 'Handshake v3', kind: 'sequence', actors: ['Gestor (NMS)','Agente SNMP'],
      intro: 'Antes de hablar, el gestor debe <b>descubrir el motor SNMP</b> del agente.',
      steps: [
        { f:0,t:1,l:'Get vacío · usuario desconocido',n:'<span class="ph">Descubrimiento</span>Una petición sin credenciales válidas para obtener el <code>engineID</code>.' },
        { f:1,t:0,l:'Report · engineID · boots · time',n:'<span class="ph">Report</span>El agente devuelve su identidad y reloj. El gestor los usa para <b>localizar las claves</b> y sincronizar el tiempo.' },
        { f:0,t:1,l:'GetRequest · HMAC + AES',n:'<span class="ph">Petición segura</span>Cabecera de seguridad con usuario, firma HMAC y payload cifrado con AES.' },
        { f:1,t:0,l:'Response · cifrada',n:'<span class="ph">Respuesta</span>El agente verifica HMAC y ventana de tiempo (anti-replay), aplica VACM y responde cifrado.' },
      ] },
    { label: 'RFC de monitoreo', kind: 'compare',
      cols: ['Estándar','RFC','Qué aporta'],
      rows: [
        ['MIB-II','1213','Objetos base: sistema, interfaces, IP, TCP…'],
        ['IF-MIB','2863','Estado y contadores de cada interfaz'],
        ['RMON','2819','Monitoreo remoto: estadísticas, alarmas, captura'],
        ['HOST-RESOURCES','2790','CPU, memoria, disco y procesos de servidores'],
        ['Syslog','5424','Registro de eventos estructurado'],
        ['IPFIX','7011','Exportación de flujos de tráfico'],
      ] },
  ] },
},
{
  id: 9, year: 1989, cat: 'gest', votes: 11,
  origin: 'CMIP/CMIS (ISO 9595/9596) · ITIL v1 (CCTA)',
  title: 'Protocolos y marcos de gobierno y gestión TIC: SNMP vs CMIP, eTOM, ISO/IEC 20000-1 e ITIL',
  short: 'Del protocolo que mueve bytes al marco que gobierna el servicio completo.',
  summary: 'La gestión se piensa en tres niveles: <strong>protocolos</strong> para obtener datos (SNMP, CMIP), <strong>marcos de procesos</strong> para operar (eTOM, ITIL) y <strong>estándares certificables</strong> para demostrar que se hace bien (ISO/IEC 20000-1). SNMP ganó la guerra de protocolos por sencillez; CMIP era más potente, pero pesado.',
  points: [
    '<b>SNMP vs CMIP:</b> simplicidad y adopción frente a riqueza orientada a objetos.',
    '<b>eTOM</b> (TM Forum): mapa de procesos para operadores de telecomunicaciones.',
    '<b>ITIL 4:</b> prácticas y cadena de valor del servicio, de uso general en TI.',
    '<b>ISO/IEC 20000-1:</b> requisitos de un sistema de gestión de servicios; es certificable, ITIL no.',
  ],
  miles: [[1988,'SNMP nace como solución «temporal» para IP.'],[1989,'ITIL: la CCTA (Reino Unido) empieza a documentar buenas prácticas.',1],[1990,'CMIP/CMIS publicados (ISO 9595/9596).',1],[2001,'TM Forum publica eTOM.'],[2005,'ISO/IEC 20000-1, derivada de BS 15000.',1],[2019,'ITIL 4 introduce el Sistema de Valor del Servicio.']],
  refs: ['ISO/IEC 9596-1 · CMIP','RFC 1157 · SNMP','TM Forum · eTOM (GB921)','ISO/IEC 20000-1:2018','ITIL 4 · AXELOS'],
  demo: { tabs: [
    { label: 'SNMP vs CMIP', kind: 'compare',
      intro: 'Dos filosofías: <b>poco y simple</b> contra <b>mucho y orientado a objetos</b>.',
      cols: ['Aspecto','SNMP','CMIP'],
      rows: [
        ['Transporte','UDP (sin conexión)','OSI, orientado a conexión (CMOT sobre TCP/IP)'],
        ['Modelo','Variables simples en MIB','Objetos gestionados con herencia'],
        ['Operaciones','Get, Set, Trap, GetBulk','M-Get, M-Set, M-Create, M-Delete, M-Action, M-Event'],
        ['Filtrado','En el gestor','En el agente (scoping y filtrado)'],
        ['Seguridad','v3: USM + VACM','Incorporada en el diseño'],
        ['Coste','Agente ligero','Pesado, caro de implementar'],
        ['Adopción','Dominante en IP','Telecom (TMN, M.3100)'],
      ] },
    { label: 'eTOM', kind: 'layers',
      intro: 'El mapa de procesos del operador: <b>Estrategia, Operaciones y Empresa</b>, cruzados con capas verticales.',
      items: [
        { k:'SIP', n:'Estrategia, Infraestructura y Producto', p:'Planificar y construir', t:'', d:'Estrategia, ciclo de vida del producto, desarrollo de infraestructura.', x:'Diseñar el catálogo de servicios del próximo año.' },
        { k:'OPS', n:'Operaciones', p:'Fulfillment · Assurance · Billing', t:'', d:'El día a día: activar, mantener y facturar el servicio. Dentro: aprovisionamiento, aseguramiento y facturación (FAB).', x:'Activar una línea, atender una avería y emitir la factura.' },
        { k:'EM', n:'Gestión empresarial', p:'Soporte corporativo', t:'', d:'Finanzas, recursos humanos, riesgos, cumplimiento y relación con grupos de interés.', x:'Auditorías y gestión de riesgo regulatorio.' },
        { k:'⊥', n:'Capas verticales', p:'Mercado · Cliente · Servicio · Recurso · Proveedor', t:'', d:'Cada proceso se aplica por capa: del mercado hasta el recurso físico y el proveedor.', x:'«Aseguramiento» a nivel de servicio ≠ aseguramiento a nivel de recurso.' },
      ] },
    { label: 'ISO/IEC 20000-1', kind: 'layers',
      intro: 'Es una norma <b>certificable</b> con estructura de alto nivel y ciclo PDCA.',
      items: [
        { k:'4', n:'Contexto de la organización', p:'Plan', t:'', d:'Partes interesadas, alcance y sistema de gestión de servicios (SGS).', x:'Definir qué servicios entran en la certificación.' },
        { k:'5', n:'Liderazgo', p:'Plan', t:'', d:'Compromiso de la dirección, política y roles.', x:'La dirección aprueba la política de servicio.' },
        { k:'6', n:'Planificación', p:'Plan', t:'', d:'Riesgos, oportunidades y objetivos.', x:'Registro de riesgos del servicio.' },
        { k:'7', n:'Apoyo', p:'Do', t:'', d:'Recursos, competencia, comunicación y documentación.', x:'Plan de formación del equipo.' },
        { k:'8', n:'Operación', p:'Do', t:'', d:'Catálogo, incidentes, problemas, cambios, niveles de servicio, capacidad, continuidad.', x:'Gestión de incidentes con SLA medido.' },
        { k:'9', n:'Evaluación del desempeño', p:'Check', t:'', d:'Monitoreo, auditoría interna y revisión por la dirección.', x:'Auditoría interna anual.' },
        { k:'10', n:'Mejora', p:'Act', t:'', d:'No conformidades, acciones correctivas y mejora continua.', x:'Acción correctiva tras un incidente grave.' },
      ] },
    { label: 'ITIL 4', kind: 'layers',
      intro: 'ITIL 4 gira alrededor del <b>Sistema de Valor del Servicio (SVS)</b>: cómo todo lo que hace TI cocrea valor.',
      items: [
        { k:'GP', n:'Principios rectores', p:'7 principios', t:'', d:'Centrarse en el valor, empezar donde estés, progresar iterativamente, colaborar, pensar y trabajar de forma holística, simple y práctica, optimizar y automatizar.', x:'Decidir entre dos soluciones usando «centrarse en el valor».' },
        { k:'GOV', n:'Gobernanza', p:'Dirigir y supervisar', t:'', d:'Cómo la organización se dirige y controla.', x:'Comité de cambios.' },
        { k:'SVC', n:'Cadena de valor', p:'6 actividades', t:'', d:'Planificar, mejorar, involucrar, diseñar y hacer la transición, obtener/construir, entregar y dar soporte.', x:'Una petición de usuario recorre la cadena hasta resolverse.' },
        { k:'PR', n:'Prácticas', p:'34 prácticas', t:'', d:'Gestión de incidentes, cambios, problemas, niveles de servicio, conocimiento, etc.', x:'Aplicar «gestión de incidentes» y «mesa de servicio».' },
        { k:'CI', n:'Mejora continua', p:'Siempre', t:'', d:'Un ciclo permanente que aplica a todo el sistema.', x:'Retrospectiva mensual de incidentes.' },
      ] },
    { label: 'Cómo se combinan', kind: 'compare',
      intro: 'No compiten: <b>operan en niveles distintos</b> y se complementan.',
      cols: ['Elemento','Nivel','¿Certificable?','Sirve para'],
      rows: [
        ['SNMP / CMIP','Protocolo','No','Obtener datos de los equipos'],
        ['eTOM','Procesos (telecom)','No','Mapa de procesos de un operador'],
        ['ITIL 4','Prácticas (TI)','Personas','Cómo operar servicios'],
        ['ISO/IEC 20000-1','Sistema de gestión','Organización','Demostrar madurez ante un auditor'],
      ] },
  ] },
},
];

/* ============================================================
   ESTADO
   ============================================================ */
const state = { order: 'chrono', filter: 'all', list: [], current: 0, openId: null };
const sc = $('#scroller'), track = $('#track'), nodesEl = $('#nodes'), wire = $('#wire');
let centers = [], wireW = 0, wireH = 0, demoTimer = null, lastFocus = null;

const sorted = () => [...TOPICS].sort((a, b) => state.order === 'chrono' ? (a.year - b.year || a.id - b.id) : a.id - b.id);

/* ============================================================
   NODOS
   ============================================================ */
function renderNodes() {
  state.list = sorted();
  nodesEl.innerHTML = '';
  state.list.forEach((t, i) => {
    const li = h('li', 'node');
    li.dataset.side = i % 2 === 0 ? 'top' : 'bot';
    li.dataset.id = t.id;
    const cat = CATS[t.cat];
    const maxVotes = Math.max(...TOPICS.map(x => x.votes));
    const card = h('button', 'card' + (t.votes === maxVotes ? ' card--top3' : ''));
    card.style.setProperty('--c', cat.color);
    card.style.setProperty('--i', i);
    card.setAttribute('aria-label', `Equipo ${t.id}, ${t.year}: ${t.title}. Abrir.`);
    card.innerHTML = `
      <div class="card__top"><span>Eq. ${String(t.id).padStart(2, '0')} · ${cat.name}</span><span class="card__year">${t.year}</span></div>
      <div class="card__body">
        <div class="card__title">${shortTitle(t)}</div>
        <div class="card__short">${t.short}</div>
        <div class="card__foot">
          <span class="votes" title="${t.votes} votos">${'<i></i>'.repeat(Math.min(t.votes, 11))}<b>${t.votes}</b></span>
          <span class="card__go">ABRIR →</span>
        </div>
      </div>`;
    card.addEventListener('click', () => { if (!sc._moved) openTopic(t.id); });
    li.append(card, h('span', 'jack'));
    nodesEl.append(li);
  });
  applyFilter();
  buildMinimap();
  requestAnimationFrame(() => { layout(); onScroll(); });
}
function shortTitle(t) { return t.title.split(':')[0]; }

function applyFilter() {
  $$('.node', nodesEl).forEach((li, i) => li.classList.toggle('is-dim', state.filter !== 'all' && state.list[i].cat !== state.filter));
}

/* ============================================================
   CABLE (SVG)
   ============================================================ */
function layout() {
  const tr = track.getBoundingClientRect();
  wireW = track.scrollWidth; wireH = track.clientHeight;
  centers = $$('.node', nodesEl).map(n => { const r = n.getBoundingClientRect(); return r.left - tr.left + sc.scrollLeft + r.width / 2; });
  // recalcular respecto al track (el track empieza en 0 del scroll)
  const t0 = track.getBoundingClientRect().left;
  centers = $$('.node', nodesEl).map(n => { const r = n.getBoundingClientRect(); return r.left - t0 + r.width / 2; });
  const cy = wireH / 2, step = 5;
  let d = `M0 ${cy}`;
  for (let x = 0; x <= wireW; x += step) {
    let env = 0.22;
    for (const c of centers) env += Math.exp(-Math.pow((x - c) / 70, 2)) * 1.0;
    const y = cy + Math.sin(x / 7.5) * 4 * clamp(env, 0, 1.15) + Math.sin(x / 31) * 3 * clamp(env - .2, 0, 1) ;
    d += ` L${x} ${y.toFixed(1)}`;
  }
  const ticks = centers.map((c, i) => `<line class="tick" x1="${c}" x2="${c}" y1="${cy - 12}" y2="${cy + 12}"/>`).join('');
  wire.setAttribute('viewBox', `0 0 ${wireW} ${wireH}`);
  wire.style.width = wireW + 'px';
  wire.innerHTML = `
    <defs><clipPath id="litclip"><rect id="litrect" x="0" y="-40" width="0" height="${wireH + 80}"/></clipPath></defs>
    <path class="base" d="${d}"/>
    <g clip-path="url(#litclip)"><path class="glow" d="${d}"/><path class="lit" d="${d}"/></g>${ticks}`;
}

/* ============================================================
   SCROLL: cable encendido, nodo actual, año gigante
   ============================================================ */
let lastCur = -1;
function onScroll() {
  const mid = sc.scrollLeft + sc.clientWidth / 2;
  const rect = $('#litrect'); if (rect) rect.setAttribute('width', Math.max(0, mid));
  let best = 0, bd = Infinity;
  centers.forEach((c, i) => { const d = Math.abs(c - mid); if (d < bd) { bd = d; best = i; } });
  const nodes = $$('.node', nodesEl);
  nodes.forEach((n, i) => { n.classList.toggle('is-lit', centers[i] <= mid); n.classList.toggle('is-current', i === best); });
  $$('.pip').forEach((p, i) => { p.classList.toggle('is-on', i === best); p.classList.toggle('is-lit', centers[i] <= mid); });
  if (best !== lastCur) {
    lastCur = best; state.current = best;
    const t = state.list[best]; if (!t) return;
    const by = $('#bigyear'), box = by.parentElement;
    box.classList.add('swap');
    setTimeout(() => { by.textContent = t.year; $('#bigcap').textContent = t.origin; box.classList.remove('swap'); }, REDUCED ? 0 : 140);
  }
}
sc.addEventListener('scroll', onScroll, { passive: true });
addEventListener('resize', () => { layout(); onScroll(); });

/* rueda → horizontal con inercia; arrastre con ratón */
let target = 0, raf = 0;
function glide() {
  const d = target - sc.scrollLeft;
  if (Math.abs(d) < .5) { sc.scrollLeft = target; raf = 0; return; }
  sc.scrollLeft += d * .16; raf = requestAnimationFrame(glide);
}
function goTo(px, smooth) {
  target = clamp(px, 0, sc.scrollWidth - sc.clientWidth);
  if (!smooth || REDUCED) { cancelAnimationFrame(raf); raf = 0; sc.scrollLeft = target; return; }
  if (!raf) raf = requestAnimationFrame(glide);
}
function goToNode(i, smooth) { i = clamp(i, 0, state.list.length - 1); goTo(centers[i] - sc.clientWidth / 2, smooth); }
sc.addEventListener('wheel', e => {
  if (state.openId) return;
  if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
    e.preventDefault();
    if (!raf) target = sc.scrollLeft;
    goTo(target + e.deltaY * (e.deltaMode === 1 ? 32 : 1.1), true);
  }
}, { passive: false });

let dragX = 0, dragSL = 0, dragging = false, vel = 0, lastX = 0, lastT = 0;
sc.addEventListener('pointerdown', e => {
  if (e.pointerType !== 'mouse' || e.button !== 0) return;
  dragging = true; sc._moved = false; dragX = e.clientX; dragSL = sc.scrollLeft; lastX = e.clientX; lastT = performance.now(); vel = 0;
});
addEventListener('pointermove', e => {
  if (!dragging) return;
  const dx = e.clientX - dragX;
  if (!sc._moved && Math.abs(dx) > 5) { sc._moved = true; sc.classList.add('drag'); }
  if (sc._moved) {
    cancelAnimationFrame(raf); raf = 0;
    sc.scrollLeft = dragSL - dx;
    const now = performance.now(); vel = (e.clientX - lastX) / Math.max(1, now - lastT); lastX = e.clientX; lastT = now;
  }
});
addEventListener('pointerup', () => {
  if (!dragging) return; dragging = false; sc.classList.remove('drag');
  if (sc._moved) { target = sc.scrollLeft; goTo(sc.scrollLeft - vel * 260, true); } // lanzamiento por velocidad
  setTimeout(() => sc._moved = false, 0);
});

/* ============================================================
   MINIMAPA, ORDEN, FILTROS
   ============================================================ */
function buildMinimap() {
  const m = $('#minimap'); m.innerHTML = '';
  state.list.forEach((t, i) => {
    const b = h('button', 'pip', String(t.id));
    b.title = `Equipo ${t.id} · ${t.year}`;
    b.setAttribute('aria-label', `Ir al equipo ${t.id}, ${t.year}`);
    b.addEventListener('click', () => goToNode(i, true));
    m.append(b);
  });
}
function moveThumb() {
  const on = $('.seg__b.is-on'), th = $('.seg__thumb');
  th.style.width = on.offsetWidth + 'px';
  th.style.transform = `translateX(${on.offsetLeft - 3}px)`;
}
$$('.seg__b').forEach(b => b.addEventListener('click', () => {
  if (state.order === b.dataset.order) return;
  state.order = b.dataset.order;
  $$('.seg__b').forEach(x => { const on = x === b; x.classList.toggle('is-on', on); x.setAttribute('aria-checked', on); });
  moveThumb(); lastCur = -1; goTo(0, false); renderNodes();
}));
$$('.chip').forEach(c => c.addEventListener('click', () => {
  state.filter = c.dataset.cat;
  $$('.chip').forEach(x => x.classList.toggle('is-on', x === c));
  applyFilter();
  const first = state.list.findIndex(t => state.filter === 'all' || t.cat === state.filter);
  if (first > -1) goToNode(first, true);
}));

/* ============================================================
   EXPEDIENTE (sheet)
   ============================================================ */
const sheet = $('#sheet'), body = $('#sheetBody');
function openTopic(id) {
  const t = TOPICS.find(x => x.id === id); if (!t) return;
  const first = !state.openId;
  state.openId = id;
  if (first) { lastFocus = document.activeElement; sheet.hidden = false; void sheet.offsetWidth; requestAnimationFrame(() => sheet.classList.add('open')); }
  renderSheet(t);
  if (first) setTimeout(() => $('#closeS').focus({ preventScroll: true }), 50);
  const i = state.list.findIndex(x => x.id === id);
  goToNode(i, true);
}
function closeSheet() {
  if (!state.openId) return;
  state.openId = null; clearInterval(demoTimer);
  sheet.classList.remove('open');
  const done = () => { if (!state.openId) { sheet.hidden = true; body.innerHTML = ''; } };
  setTimeout(done, REDUCED ? 20 : 260);
  if (lastFocus) lastFocus.focus({ preventScroll: true });
}
function stepTopic(dir) {
  const i = state.list.findIndex(x => x.id === state.openId);
  const n = state.list[clamp(i + dir, 0, state.list.length - 1)];
  if (n && n.id !== state.openId) openTopic(n.id);
}
$$('[data-close]').forEach(e => e.addEventListener('click', closeSheet));
$('#prevT').addEventListener('click', () => stepTopic(-1));
$('#nextT').addEventListener('click', () => stepTopic(1));

function renderSheet(t) {
  clearInterval(demoTimer);
  const cat = CATS[t.cat], idx = state.list.findIndex(x => x.id === t.id);
  sheet.style.setProperty('--acc', cat.color);
  $('#sheetPos').textContent = `${idx + 1} / ${state.list.length} · ${state.order === 'chrono' ? 'CRONOLOGÍA' : 'POR EQUIPO'}`;
  $('#prevT').disabled = idx === 0; $('#nextT').disabled = idx === state.list.length - 1;
  $('#prevT').style.opacity = idx === 0 ? .3 : 1; $('#nextT').style.opacity = idx === state.list.length - 1 ? .3 : 1;
  const total = TOPICS.reduce((s, x) => s + x.votes, 0);

  body.innerHTML = '';
  const info = h('div', 'pane pane--info');
  let i = 0; const R = () => `class="rise" style="--i:${i++}"`;
  info.innerHTML = `
    <div ${R()}><div class="eyebrow"><b>EQUIPO ${String(t.id).padStart(2, '0')}</b><span>${cat.name} · desde ${t.year}</span></div></div>
    <h2 id="sheet-title" ${R()}>${t.title}</h2>
    <p class="lead rise" style="--i:${i++}">${t.summary}</p>
    <div class="h3 rise" style="--i:${i++}">Puntos clave</div>
    <ul class="points">${t.points.map(p => `<li ${R()}>${p}</li>`).join('')}</ul>
    <div class="h3 rise" style="--i:${i++}">Hitos</div>
    <ol class="miles">${t.miles.map((m, k) => `<li class="${m[2] ? 'main' : ''}" style="--i:${k}"><time>${m[0]}</time><span>${m[1]}</span></li>`).join('')}</ol>
    <div class="h3 rise" style="--i:${i++}">Normas y referencias</div>
    <div class="refs rise" style="--i:${i++}">${t.refs.map(r => `<span>${r}</span>`).join('')}</div>
    <div class="h3 rise" style="--i:${i++}">Votación</div>
    <p class="rise" style="--i:${i++};font-family:var(--f-mono);font-size:12px;color:rgba(244,238,223,.7)">${t.votes} de ${total} votos (${Math.round(t.votes / total * 100)} %)</p>`;
  const demo = h('div', 'pane pane--demo');
  demo.innerHTML = `<div class="demo__label rise" style="--i:2">Laboratorio interactivo</div>`;
  mountDemo(demo, t.demo);
  body.append(info, demo);
  info.scrollTop = 0; demo.scrollTop = 0;
}

/* ============================================================
   DEMOS
   ============================================================ */
function mountDemo(host, demo) {
  const tabs = h('div', 'tabs rise'); tabs.style.setProperty('--i', 3);
  tabs.setAttribute('role', 'tablist');
  const ink = h('span', 'tabs__ink'); tabs.append(ink);
  const panelHost = h('div');
  const btns = demo.tabs.map((tb, i) => {
    const b = h('button', 'tab', tb.label);
    b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', i === 0);
    b.addEventListener('click', () => select(i));
    b.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { e.preventDefault(); select((i + 1) % btns.length, true); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); select((i - 1 + btns.length) % btns.length, true); }
    });
    tabs.insertBefore(b, ink); return b;
  });
  function select(i, focus) {
    clearInterval(demoTimer);
    btns.forEach((b, k) => { b.setAttribute('aria-selected', k === i); b.tabIndex = k === i ? 0 : -1; });
    ink.style.width = '100px';
    ink.style.transform = `translateX(${btns[i].offsetLeft}px) scaleX(${btns[i].offsetWidth / 100})`;
    if (focus) btns[i].focus();
    panelHost.innerHTML = '';
    const tb = demo.tabs[i], p = h('div', 'panel'); p.setAttribute('role', 'tabpanel');
    if (tb.intro) p.append(h('p', 'panel__intro', tb.intro));
    ({ sequence: dSequence, layers: dLayers, tree: dTree, compare: dCompare, code: dCode })[tb.kind](p, tb);
    panelHost.append(p);
  }
  host.append(tabs, panelHost);
  requestAnimationFrame(() => select(0));
}

/* ---- Diagrama de secuencia paso a paso ---- */
function dSequence(p, tb) {
  const N = tb.actors.length, wrap = h('div', 'seqwrap'), seq = h('div', 'seq');
  seq.style.setProperty('--n', N);
  seq.innerHTML = `<div class="seq__head">${tb.actors.map(a => `<div class="seq__actor">${a}</div>`).join('')}</div>`;
  const rows = tb.steps.map(s => {
    const row = h('div', 'step');
    row.innerHTML = `<div class="lanes">${'<span></span>'.repeat(N)}</div>`;
    const a = h('div', 'arrow'), lo = Math.min(s.f, s.t), hi = Math.max(s.f, s.t);
    if (s.f === s.t) { a.classList.add('self'); a.style.left = `${(s.f + .5) / N * 100}%`; }
    else { a.classList.add(s.t > s.f ? 'r' : 'l'); a.style.left = `${(lo + .5) / N * 100}%`; a.style.width = `${(hi - lo) / N * 100}%`; }
    a.innerHTML = `<span class="lbl">${s.l}</span>`;
    row.append(a); seq.append(row); return row;
  });
  wrap.append(seq); p.append(wrap);
  const note = h('div', 'note'); p.append(note);
  const ctrl = h('div', 'ctrl');
  const next = h('button', 'btn btn--p', 'Siguiente paso →'), auto = h('button', 'btn', '▶ Auto'), reset = h('button', 'btn', '↺ Reiniciar'), cnt = h('span', 'ctrl__n');
  ctrl.append(next, auto, reset, cnt); p.append(ctrl);
  let k = -1;
  const paint = () => {
    rows.forEach((r, i) => { r.classList.toggle('on', i <= k); r.classList.toggle('cur', i === k); });
    note.innerHTML = k < 0 ? '<span class="ph">Listo</span>Pulsa <b>Siguiente paso</b> para recorrer el intercambio mensaje a mensaje.' : tb.steps[k].n;
    cnt.textContent = `${Math.max(0, k + 1)} / ${rows.length}`;
    next.disabled = k >= rows.length - 1;
    if (k >= rows.length - 1) { clearInterval(demoTimer); auto.textContent = '▶ Auto'; }
  };
  const adv = () => { if (k < rows.length - 1) { k++; paint(); } };
  next.addEventListener('click', () => { clearInterval(demoTimer); auto.textContent = '▶ Auto'; adv(); });
  reset.addEventListener('click', () => { clearInterval(demoTimer); auto.textContent = '▶ Auto'; k = -1; paint(); });
  auto.addEventListener('click', () => {
    if (demoTimer && auto.textContent.startsWith('❚')) { clearInterval(demoTimer); auto.textContent = '▶ Auto'; return; }
    if (k >= rows.length - 1) k = -1;
    auto.textContent = '❚❚ Pausa'; adv();
    clearInterval(demoTimer); demoTimer = setInterval(adv, 1500);
  });
  paint();
}

/* ---- Capas / listas seleccionables (con animación de encapsulado opcional) ---- */
function dLayers(p, tb) {
  const list = h('div', 'layers'), det = h('div', 'detail');
  const btns = tb.items.map((it, i) => {
    const b = h('button', 'layer');
    b.innerHTML = `<span class="layer__k">${it.k}</span><span class="layer__n">${it.n}${it.t ? `<small>${it.t}</small>` : ''}</span><span class="layer__p">${it.p || ''}</span>`;
    b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', () => sel(i)); list.append(b); return b;
  });
  function sel(i) {
    btns.forEach((b, k) => b.setAttribute('aria-pressed', k === i));
    const it = tb.items[i];
    det.style.animation = 'none'; void det.offsetWidth; det.style.animation = '';
    det.innerHTML = `<h4>${it.n}</h4><p>${it.d}${it.m ? ` <em style="opacity:.65">· En TCP/IP: ${it.m}.</em>` : ''}</p><div class="ex"><b>Ejemplo</b>${it.x}</div>`;
  }
  p.append(list);
  if (tb.animate) {
    const pkt = h('div', 'pkt'), ctrl = h('div', 'ctrl'), go = h('button', 'btn btn--p', '▶ Enviar mensaje');
    ctrl.append(go); p.append(ctrl, pkt);
    const CH = { data: ['c-data', 'DATOS'], tcp: ['c-tcp', 'TCP'], ip: ['c-ip', 'IP'], eth: ['c-eth', 'ETH'] };
    const frame = (stage, down) => { // stage: índice de capa 0..6 (7→1)
      const chips = [];
      for (let i = stage; i >= 0; i--) { /* cabeceras externas primero */ }
      const parts = [];
      tb.items.forEach((it, i) => { if (it.hdr && i <= stage) parts.push(it); });
      const out = parts.reverse().map(it => it.hdr === 'bits' ? '' : `<span class="${CH[it.hdr][0]}">${CH[it.hdr][1]}</span>`);
      if (stage >= 5) out.push('<span class="c-fcs">FCS</span>');
      if (stage === 6) return `<span class="c-bits">${'01101001 10100110 '.repeat(2)}</span>`;
      pkt.innerHTML = out.join('');
      return null;
    };
    go.addEventListener('click', () => {
      clearInterval(demoTimer); go.disabled = true;
      const seq = [0,1,2,3,4,5,6,5,4,3,2,1,0]; let n = 0;
      demoTimer = setInterval(() => {
        const st = seq[n]; btns.forEach((b, k) => b.classList.toggle('flash', k === st));
        const bits = frame(st); if (bits) pkt.innerHTML = bits;
        sel(st); n++;
        if (n >= seq.length) { clearInterval(demoTimer); go.disabled = false; setTimeout(() => btns.forEach(b => b.classList.remove('flash')), 420); }
      }, 2600);
    });
    pkt.innerHTML = '<span class="c-data">DATOS</span>';
  }
  p.append(det); sel(0);
}

/* ---- Árbol OID ---- */
const OID = { n:'iso', id:1, d:'Raíz del árbol, administrada por ISO.', c:[{ n:'org', id:3, d:'Organizaciones reconocidas por ISO.', c:[{ n:'dod', id:6, d:'Departamento de Defensa de EE. UU., quien impulsó Internet.', c:[{ n:'internet', id:1, d:'Todo lo relacionado con Internet.', c:[
  { n:'directory', id:1, d:'Reservado para servicios de directorio (OSI).' },
  { n:'mgmt', id:2, d:'Objetos de gestión estandarizados por el IETF.', c:[{ n:'mib-2', id:1, d:'MIB-II (RFC 1213): la base de casi toda gestión SNMP.', c:[
    { n:'system', id:1, d:'Información general del equipo.', c:[
      { n:'sysDescr', id:1, v:'«Cisco IOS XE Software, Version 17.9»', d:'Descripción textual del equipo.' },
      { n:'sysObjectID', id:2, v:'1.3.6.1.4.1.9.1.1745', d:'Identificador del fabricante y modelo.' },
      { n:'sysUpTime', id:3, v:'TimeTicks 8640000 (≈ 1 día)', d:'Tiempo desde el último reinicio, en centésimas de segundo.' },
      { n:'sysContact', id:4, v:'«noc@empresa.com»', d:'Persona de contacto.' },
      { n:'sysName', id:5, v:'«router-core-01»', d:'Nombre administrativo del nodo.' },
      { n:'sysLocation', id:6, v:'«CPD Norte · Rack 12»', d:'Ubicación física.' }] },
    { n:'interfaces', id:2, d:'Interfaces de red del equipo.', c:[
      { n:'ifNumber', id:1, v:'Integer 24', d:'Número de interfaces.' },
      { n:'ifTable', id:2, d:'Tabla: una fila por interfaz (se indexa, p. ej. ifDescr.3).' }] },
    { n:'ip', id:4, d:'Estadísticas y tablas de IP (rutas, direcciones).' },
    { n:'icmp', id:5, d:'Contadores ICMP.' },
    { n:'tcp', id:6, d:'Conexiones y contadores TCP.' },
    { n:'udp', id:7, d:'Contadores UDP.' },
    { n:'snmp', id:11, d:'Estadísticas del propio agente SNMP.' }] }] },
  { n:'experimental', id:3, d:'Objetos en fase experimental.' },
  { n:'private', id:4, d:'Ramas de empresas privadas.', c:[{ n:'enterprises', id:1, d:'Cada fabricante registra aquí su número (IANA).', c:[
    { n:'ibm', id:2, d:'IBM.' }, { n:'cisco', id:9, d:'Cisco Systems.' }, { n:'hp', id:11, d:'Hewlett-Packard.' }, { n:'net-snmp', id:8072, d:'Proyecto Net-SNMP.' }, { n:'microsoft', id:311, d:'Microsoft.' }] }] }
] }] }] }] };

function dTree(p) {
  const wrap = h('div'); const info = h('div', 'detail'); let selBtn = null;
  const build = (node, path, depth) => {
    const li = h('li'), oid = [...path, node.id], b = h('button');
    const kids = node.c && node.c.length;
    b.innerHTML = `<span class="tw">${kids ? '▸' : '·'}</span>${node.n}<i>(${node.id})</i>`;
    li.append(b);
    b.addEventListener('click', () => {
      if (kids) li.classList.toggle('open');
      if (selBtn) selBtn.removeAttribute('aria-current'); selBtn = b; b.setAttribute('aria-current', 'true');
      const dotted = oid.join('.'), inst = node.v ? `<div class="oid">${dotted}.0</div><p style="font-size:12.5px;opacity:.75">Instancia del escalar (sufijo .0) → <b>${node.v}</b></p>` : '';
      info.style.animation = 'none'; void info.offsetWidth; info.style.animation = '';
      info.innerHTML = `<h4>${node.n}</h4><div class="oid">${dotted}</div><p>${node.d}</p>${inst}<p style="font-size:12px;opacity:.6;font-family:var(--f-mono)">${nameChain(oid)}</p>`;
    });
    if (kids) { const ul = h('ul'); node.c.forEach(c => ul.append(build(c, oid, depth + 1))); li.append(ul); }
    if (kids && depth < 7) li.classList.add('open');
    return li;
  };
  const names = {}; (function walk(n, path) { const o = [...path, n.id]; names[o.join('.')] = n.n; (n.c || []).forEach(c => walk(c, o)); })(OID, []);
  function nameChain(oid) { return oid.map((_, i) => names[oid.slice(0, i + 1).join('.')]).join(' › '); }
  const root = h('ul', 'otree'); root.append(build(OID, [], 0)); wrap.append(root, info); p.append(wrap);
  info.innerHTML = '<h4>Elige un nodo</h4><p>Cada clic revela la dirección única del objeto dentro del árbol mundial de gestión.</p>';
  $$('button', root).find(b => b.textContent.startsWith('▸sysName') || b.textContent.includes('sysName'))?.click();
}

/* ---- Tabla comparativa ---- */
function dCompare(p, tb) {
  const w = h('div', 'tblwrap');
  w.innerHTML = `<table><thead><tr>${tb.cols.map(c => `<th>${c}</th>`).join('')}</tr></thead><tbody>${tb.rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  p.append(w);
}

/* ---- Código ASN.1 ---- */
function dCode(p, tb) {
  const esc = tb.text.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const html = esc
    .replace(/(--.*)/g, '<span class="c">$1</span>')
    .replace(/\b(OBJECT-TYPE|SYNTAX|MAX-ACCESS|STATUS|DESCRIPTION)\b/g, '<span class="k">$1</span>')
    .replace(/(&quot;|")([^"]*)(")/g, '<span class="s">"$2"</span>')
    .replace(/(::=)/g, '<span class="k">$1</span>')
    .replace(/\b(read-write|read-only|current|DisplayString|SIZE)\b/g, '<span class="n">$1</span>');
  p.append(h('pre', 'code', html));
}

/* ============================================================
   TECLADO
   ============================================================ */
addEventListener('keydown', e => {
  if (state.openId) {
    if (e.key === 'Escape') closeSheet();
    else if (e.key === 'ArrowRight' && e.altKey) stepTopic(1);
    else if (e.key === 'ArrowLeft' && e.altKey) stepTopic(-1);
    return;
  }
  if (e.target.closest && e.target.closest('.mast, .dock')) return;
  if (e.key === 'ArrowRight') { e.preventDefault(); goToNode(state.current + 1, false); }
  else if (e.key === 'ArrowLeft') { e.preventDefault(); goToNode(state.current - 1, false); }
  else if (e.key === 'Enter' && document.activeElement === sc) { const t = state.list[state.current]; if (t) openTopic(t.id); }
});

/* ============================================================
   INICIO
   ============================================================ */
document.fonts.ready.then(() => { moveThumb(); layout(); onScroll(); });
renderNodes(); moveThumb();
sc.focus({ preventScroll: true });
