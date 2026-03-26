LogiStock Solutions
Software Architecture
Description – C4 Model
Autor:
Yuri Andrea Ramírez Reyes
Aslen Ruben Garrido Betancur
Versión: 1.0
Fecha: 19/12/2025
Logistock Solutions
Software Architecture Description – C4 Model
Curso: Ingeniería de software III
1.1 Usuarios principales
● Cliente: Actor externo que alquila una bodega. Puede
consultar su inventario, visualizar el historial de movimientos y
solicitar el retiro de productos a través del sistema.
● Empresa administradora de bodegas: Organización
responsable de ofrecer el servicio de almacenamiento y
operar el sistema LogiStock Solutions.
● Administrador: Gestiona usuarios, roles y configuraciones
generales del sistema.
● Jefe de bodega: Administra bodegas, productos y clientes;
autoriza los movimientos de inventario.
● Operario/Auxiliar: Ejecuta los ingresos y retiros de productos
conforme a las órdenes emitidas por el jefe de bodega.
1.2 Problema que resuelve
LogiStock Solutions es una aplicación web diseñada para apoyar la
gestión integral de bodegas de almacenamiento. La solución
permite administrar bodegas con diferentes características y
precios, gestionar clientes y usuarios, y controlar el inventario y los
movimientos de productos de manera centralizada.
El sistema ofrece acceso diferenciado según el rol del usuario,
garantizando la correcta separación de responsabilidades entre la
administración del sistema, la operación de las bodegas y la
consulta de información por parte de los clientes. De esta forma,
LogiStock Solutions busca optimizar los procesos operativos,
mejorar la trazabilidad de los productos y facilitar el acceso a la
información de forma segura y confiable.
1. RESUMEN ARQUITECTÓNICO
La gestión de bodegas de almacenamiento requiere herramientas
que permitan administrar de forma eficiente los espacios, el
inventario y los movimientos de productos, garantizando la
trazabilidad y el control de la información. En muchos contextos, la
falta de sistemas integrados dificulta el seguimiento de los bienes
almacenados y la correcta coordinación entre clientes y personal
operativo.
LogiStock Solutions es una aplicación web propuesta para apoyar
la gestión integral de bodegas de almacenamiento, permitiendo
administrar bodegas con diferentes características y precios, así
como ofrecer a los clientes planes de alquiler bajo modalidades
mensuales o anuales. El sistema contará con distintos roles de
usuario que permitirán separar responsabilidades entre la gestión
administrativa, la operación de la bodega y el acceso de los
clientes a la información relacionada con su inventario y
movimientos.
Logistock Solutions
Software Architecture Description – C4 Model
Curso: Ingeniería de software III
1.4 Procesos involucrados en el sistema LogiStock Solutions
● Proceso de gestión de usuarios
Objetivo: permitir el acceso controlado al sistema según el rol.
Incluye:
○ Registro de usuarios (cliente, operario, jefe de bodega).
○ Autenticación e inicio de sesión.
○ Asignación de roles (cliente, administrador, jefe de
bodega, operario).
○ Gestión de perfiles de usuario.
● Proceso de gestión de inventario
Objetivo: Administrar el ciclo completo de las bodegas
(creación, modificación) y controlar el movimiento de
productos (ingresos, retiros, inventarios).
Incluye:
○ Características de nueva bodega (tamaño, ubicación,
precio, etc)
○ Productos para ingreso
○ Solicitudes de retiro de producto
○ Autorizaciones del jefe de bodega
○ Registro de ingreso/retiro de producto
○ Inventario actualizado
● Proceso de Portal de Clientes
Objetivo: Brindar al cliente una plataforma digital completa
para seleccionar, adquirir y gestionar autónomamente su
bodega de almacenamiento, incluyendo el monitoreo.
Incluye:
○ Requerimientos del cliente (tamaño, ubicación,
presupuesto)
○ Datos personales y de contacto
○ Selección de bodega específica
○ Solicitudes de ingreso/retiro de productos
○ Bodega específica seleccionada y reservada
○ Credenciales de acceso al sistema
○ Dashboard de la bodega
○ Reportes y movimientos
1.3 Alcance
El proyecto LogiStock Solutions contempla el desarrollo de una
aplicación web orientada a la gestión de bodegas de
almacenamiento, incluyendo la administración de bodegas, clientes,
usuarios e inventario. El sistema permitirá asignar bodegas a clientes,
gestionar planes de alquiler y controlar los ingresos, retiros y
movimientos de productos dentro de las bodegas.
La aplicación contará con roles diferenciados: administrador, jefe de
bodega y operario, encargados de la gestión y ejecución de los
procesos operativos, así como un acceso para clientes que les
permitirá consultar su inventario, visualizar el historial de
movimientos y solicitar el retiro de productos. El sistema estará
enfocado exclusivamente en la administración del almacenamiento
y el control operativo interno de las bodegas.
Logistock Solutions
Software Architecture Description – C4 Model
Curso: Ingeniería de software III
2.1 Diagrama de contexto (N1)
Presenta el sistema logiStockSolutions como “caja negra”, usuarios y
sistemas externos.
● Cliente
Cliente [Persona]
Un usuario que realiza una
reserva de bodega en línea a
través del portal, consulta
tipo de bodegas disponibles,
selecciona la bodega que se
acomoda la necesidad y
gestiona sus solicitudes
desde la aplicación.
logiStockSolutions
[Sistema de Software]
Permite a los clientes explorar tipos de
bodegas, reservar bodega o bodegas, ,
hacer seguimiento de la entradas y salidas
y efectuar pagos desde la aplicación móvil.
Servicio de
Notificaciones y Correo [Sistema de Software]
Servicio en la nube que gestiona correos
electrónicos y notificaciones enviando
confirmaciones de reserva,
actualizaciones de estado y avisos al
cliente.
Pasarela de Pagos [Sistema de Software]
Se encarga del procesamiento de pagos
en línea, validación de tarjetas, manejo de
transacciones, autorizaciones y
confirmación del pago de los pedidos.
Envía correos
electrónicos y
mensajes de
confirmación a
Realiza reserva, paga,
consulta historial y
estado
Envía
notificaciones
(push/correo)
Procesa pago /
autoriza
transacción
Confirmación
del pago a
2. C4MODEL
Aunque logiStockSolutions contempla los roles de cliente, jefe de
bodega, operario y administrador, las vistas C4 presentadas en este
documento se enfocan únicamente en el alcance del cliente (app
móvil, backend, base de datos e integraciones externas). Las
capacidades de operarios y administrador forman parte del sistema
global descrito en el Ítem 1, pero se documentarán en futuras versiones.
Logistock Solutions
Software Architecture Description – C4 Model
Curso: Ingeniería de software III
● Jefe de Bodega
Jefe de Bodega [Persona]
Usuario responsable de
administrar las bodegas,
productos y clientes; autoriza
los movimientos de
inventario y supervisa las
operaciones diarias de
almacenamiento
logiStockSolutions
[Sistema de Software]
Permite al jefe de bodega configurar
espacios de almacenamiento, asignar
productos a clientes, aprobar solicitudes de
ingreso/retiro y monitorear el estado del
inventario en tiempo real..
Servicio de
Notificaciones y
Correo [Sistema de Software]
Servicio en la nube que gestiona correos
electrónicos y notificaciones enviando
alertas al jefe de bodega y cliente sobre
solicitudes pendientes de autorización,
movimientos realizados y reportes de
inventario
Autoriza movimientos,
supervisa operarios,
gestiona productos
Envía
notificaciones
(push/correo)
Sistema de Reportes [Sistema de Software]
Genera informes de ocupación, rotación
y productividad.
Logistock Solutions
Software Architecture Description – C4 Model
Curso: Ingeniería de software III
● Administrador
Administrador [Persona]
Usuario con máximo nivel de
privilegios que gestiona
usuarios, roles y
configuraciones generales del
sistema, asegurando el
correcto funcionamiento de la
plataforma y la asignación de
permisos.
logiStockSolutions
[Sistema de Software]
Sistema que expone al administrador los
paneles de control de usuarios, bitácoras
de actividades, configuración de planes,
precios y parámetros generales de la
aplicación.
Servicio de
Notificaciones y
Correo [Sistema de Software]
Servicio en la nube que envía al
administrador alertas sobre intentos de
acceso no autorizados, creación de
nuevos usuarios y cambios críticos en la
configuración del sistema.
Gestiona usuarios,
asigna roles, configura
parámetros del
sistema, supervisa logs
Envía
notificaciones
(push/correo)
Sistema de logs [Sistema de Software]
Sistema que almacena y visualiza los
registros de actividad de todos los
usuarios, permitiendo al administrador
auditar acciones y detectar
comportamientos anómalos.
Logistock Solutions
Software Architecture Description – C4 Model
Curso: Ingeniería de software III
● Auxiliar
Auxiliar [Persona]
Usuario que ejecuta los ingresos y
retiros de productos en la bodega,
siguiendo las órdenes emitidas
por el jefe de bodega, verificando
físicamente los ítems y
registrando los movimientos en el
sistema.
logiStockSolutions
[Sistema de Software]
Sistema que muestra al operario las
órdenes de trabajo pendientes, permite
registrar la entrada/salida de productos,
valida códigos de barras y actualiza el
inventario en tiempo real.
Servicio de
Notificaciones y
Correo [Sistema de Software]
Servicio en la nube que envía
confirmaciones al jefe de bodega
cuando el operario completa un
movimiento y notifica al cliente sobre el
ingreso/retiro de sus productos.cliente.
Ejecuta ingresos de
productos, realiza
retiros, confirma
movimientos, escanea
códigos
Envía
notificaciones
(push/correo)
Logistock Solutions
Software Architecture Description – C4 Model
Curso: Ingeniería de software III
2.2 Diagrama de contenedores (N2)
Presenta “qué partes ejecutables” tiene el sistema logiStockSolutions
(web, API, BD, app móvil, colas, etc.).
● Cliente
Cliente
Servicio de
Notificaciones
y Correo [Sistema de Software]
Pasarela de
Pagos [Sistema de Software]
Sistema de reserva o solicitud de bodega en Línea
Mobile App
[Container: Android
(onsen/typescript)]
Backend
[Container: TypeScript (node
js +, espress)]
>_
Database
[Container:
postgress Database
Schema]
Almacenamiento Documentos
[Container: PostgreSQL DB Schema]
Usuario que realiza
reservas de bodega en
línea, consulta tipos de
bodegas disponibles y
gestiona sus solicitudes.
Envía correos
electrónicos y
mensajes de
confirmación a
Realiza llamadas API al
Backend usando
[HTTPS/JSON (REST)]
Comprobantes de
reserva
Documentos
contractuales Lee y escribe en la
base de datos
[SQL / ORM (sequelize)]
Realiza
llamadas API a
la Pasarela de
Pagos usando
[HTTPS/API de
pagos]
Envía solicitudes para
generar correos
electrónicos y
notificaciones
[HTTPS/API notificaciones]
Web App
[Container: react
(typescript)]
Logistock Solutions
Software Architecture Description – C4 Model
Curso: Ingeniería de software III
2.2 Diagrama de contenedores (N2)
Presenta “qué partes ejecutables” tiene el sistema logiStockSolutions
(web, API, BD, app móvil, colas, etc.).
● Jefe de bodega
Jefe de
bodega
Servicio de
Notificaciones
y Correo [Sistema de Software]
Sistema de reserva o solicitud de bodega en Línea
Web App
[Container: react
(typescript)]
Backend
[Container: Type
Script(node js +,
espress)]
>_
Database
[Container:
postgress Database
Schema]
Almacenamiento Reportes
[Container: PostgreSQL DB Schema]
Usuario responsable de
administrar las bodegas,
productos; autoriza los
movimientos de inventario
y supervisa las operaciones
diarias de
almacenamiento.
Envía correos
electrónicos y
mensajes de
confirmación a
Realiza llamadas API al
Backend usando
[HTTPS/JSON (REST)]
Sube/consulta
PDFs (reportes de
ocupación,
informes) Lee y escribe en la
base de datos
[SQL / ORM (sequelize)]
Envía solicitudes para
generar correos
electrónicos y
notificaciones
[HTTPS/API notificaciones]
Logistock Solutions
Software Architecture Description – C4 Model
Curso: Ingeniería de software III
2.2 Diagrama de contenedores (N2)
Presenta “qué partes ejecutables” tiene el sistema logiStockSolutions
(web, API, BD, app móvil, colas, etc.).
● Administrador
Administrador
Servicio de
Notificaciones
y Correo [Sistema de Software]
Sistema de reserva o solicitud de bodega en Línea
Mobile App
[Container: Android
(typescript)]
Backend
[Container:
(typescript, node,
espress)]
>_
Database
[Container:
postgress Database
Schema]
Almacenamiento Documentos
[Container: PostgreSQL DB Schema]
Envía alertas al admin
sobre accesos no
autorizados, nuevos
usuarios y cambios
criticos en la
configuración.
Realiza llamadas API al
Backend usando
[HTTPS/JSON (REST)]
PDFS de facturas,
recibos. Lee y escribe en la
base de datos
[SQL / ORM (sequelize)]
Envía solicitudes para
generar correos
electrónicos y
notificaciones
[HTTPS/API notificaciones]
Web App
[Container: Android
(typescript)]
Usuario con máximo nivel de
privilegios. Gestiona usuarios, roles y
configuraciones generales del
sistema, asegurando el correcto
funcionamiento de la plataforma y
la asignación de los permisos.
Gestiona desde móvil Gestiona usuarios,
asigna roles y
configura parámetros
Logistock Solutions
Software Architecture Description – C4 Model
Curso: Ingeniería de software III
2.2 Diagrama de contenedores (N2)
Presenta “qué partes ejecutables” tiene el sistema logiStockSolutions
(web, API, BD, app móvil, colas, etc.).
● Auxiliar
Auxiliar
Servicio de
Notificaciones
y Correo [Sistema de Software]
Sistema de reserva o solicitud de bodega en Línea
Mobile App
[Container: Android
(typescript)]
Backend
[Container:
TypeScript (node,
espress)]
>_
Database
[Container:
postgress Database
Schema]
Almacenamiento Documentos
[Container: PostgreSQL DB Schema]
Registra ingresos/retiros,
escanea productos,
confirma movimientos
Envía correos
electrónicos y
mensajes de
confirmación a
Realiza llamadas API al
Backend usando
[HTTPS/JSON (REST)]
Sube/consulta
actas de
movimiento (PDF) Lee y escribe en la
base de datos
[SQL / ORM (sequelize)]
Envía solicitudes para
generar correos
electrónicos y
notificaciones
[HTTPS/API notificaciones]
Logistock Solutions
Software Architecture Description – C4 Model
Curso: Ingeniería de software III
2.3 Diagrama de componentes (N3)
Presenta el interior de los contenedor de Logistock Solutions (por
ejemplo, el Backend/API).
Servicio de
Notificaciones
y Correo [Sistema de Software]
Pasarela de
Pagos [Sistema de Software]
Web App
[Container: Android
(Typescript)]
Backend
API de
Inicio de
Sesión
API de
Bodegas
API de
Inventario
Componen
te de
Historial y
Facturas
Componen
te de
seguridad
Database
[Container: postgres
Database Schema]
Almacenamiento Documentos
[Container: PostgreSQL DB Schema]
Componente
de
Notificacione
s
Envía
credenciales
Consulta
bodegas
Solicita
inventario
Lee/escribe
usuarios/sesion
es
Valida
credenciales
Envía
notificaciones
(JSON/HTTPS)
Lee y escribe
recibos y
facturas en PDF
en
Nota: En la arquitectura del sistema se distingue entre la API de Pedidos, que actúa
como el punto de entrada exponiendo los servicios REST consumidos por la aplicación
móvil, y el Componente de Solicitudes, que concentra la lógica de negocio, la gestión de
estados y la coordinación con otros componentes del sistema.
API de
Movimientos
Envía
notificaciones al
usuario
Sollicita Pago
Logistock Solutions
Software Architecture Description – C4 Model
Curso: Ingeniería de software III
2.3 Diagrama de componentes (N3)
Presenta el interior de los contenedor de LogistockSolutions(por
ejemplo, el Backend/API) del administrador.
Servicio de
Notificaciones
y Correo [Sistema de Software]
Mobile /Web
App
[Container:
Android-web
(TypeScript)]
Backend
API de
Inicio de
Sesión
API de
usuarios y
Roles
API de
configuraci
ón
Componen
te de
reportes
Componen
te de
seguridad
Componen
te de
Notificacio
nes
Database
[Container: Postgres
Database Schema]
Almacenamiento Documentos
[Container: PostgreSQL DB Schema]
Envía
credenciales
Gestiona
usuarios/roles
Configuración
parámetros/tarifas/
alertas
Lee/escribe
usuarios/sesion
es
Valida
credenciales
Solicita
envío de
correos y
notificacion
es usando
Envía
notificaciones
(JSON/HTTPS)
Lee/escribe
usuarios y
roles
Dispara
API de
dashboard
consulta
dashboard
Genera metricas
y pdfs
Obtiene
historial y
reportes
Nota arquitectónica: El Componente de Logs actúa de forma transversal — registra la
actividad de todos los actores del sistema, no solo del Administrador. Sin embargo,
solo el Administrador tiene acceso a consultarlos a través de la API de Logs,
garantizando auditoría centralizada sin exponer información sensible a otros roles.
Acceso no
autorizado,cambios
criticos,nuevo
usuario creeado
Recibe
alertas
críticas
Logistock Solutions
Software Architecture Description – C4 Model
Curso: Ingeniería de software III
2.3 Diagrama de componentes (N3)
Presenta el interior de los contenedor de LogistockSolutions(por
ejemplo, el Backend/API) del jefe de bodega.
Servicio de
Notificaciones
y Correo [Sistema de Software]
Mobile /Web
App
[Container:
Android-web
(TypeScript)]
API de
Inicio de
Sesión
API de
órdenes de
trabajo
API de
inventario
Componente
de
Autorizacion
[reglas de negocio]
Componen
te de
seguridad
Componen
te de
Notificacio
nes
Database
[Container: PostgreSQL Database Schema]
Almacenamiento Documentos
[Container: PostgreSQL DB Schema]
Generar
reportes
Asigna órdenes
a auxiliares
consulta inventario
Lee/escribe
usuarios/sesion
es
Valida
credenciales
Solicita
envío de
correos y
notificacion
Envía
notificaciones
(JSON/HTTPS)
Lee/escribe
ordenes API de
solicitudes
Aprueba/rec
haza
solicitudes
Nota arquitectónica: Se distingue entre la API de Solicitudes, que actúa como punto
de entrada REST, y el Componente de Autorización, que concentra toda la lógica de
negocio para aprobar o rechazar movimientos. Este componente es el único
autorizado para cambiar el estado de una solicitud y disparar las notificaciones
correspondientes tanto al Cliente como al Auxiliar.
solicitud
aproba(Cliente),
nueva
orden(auxiliar).
asignar orden
de trabajo
Lee inventario
en tiempo real
API de
productos
y clientes
Gestiona
productos/clientes
Lee/escribe
productos
y asignaciones
Componente
de reportes
API de
reportes
Envía
credenciales
Logistock Solutions
Software Architecture Description – C4 Model
Curso: Ingeniería de software III
2.3 Diagrama de componentes (N3)
Presenta el interior de los contenedor de LogistockSolutions(por
ejemplo, el Backend/API) auxiliar.
Servicio de
Notificaciones
y Correo [Sistema de Software]
Mobile /
Web App
[Container: Android
(Typescript)]
API de
Inicio de
Sesión
Backend<
API de
órdenes de
trabajo
API de
Inventario
Componen
te de
Movimient
os
Componen
te de
seguridad
Componen
te de
Notificacio
nes
Database
[Container: PostgreSQL Database Schema]
Almacenamiento Movimientos
[Container: PostgreSQL DB Schema]
Envía
credenciales
Consulta de
órdenes
asignadas
Confirma
movimiento
completado
Lee/escribe
usuarios/sesion
es
Valida
credenciales
Envía
notificaciones
(JSON/HTTPS)
leer órdenes
pendientes
API de
Movimiento
s
Registra
ingreso/retiro
Genera PDF acta
Nota: La API de Movimientos, que actúa como punto de entrada REST, y el Componente
de Movimientos, que concentra la lógica de negocio para validar, registrar y confirmar
cada movimiento. Este componente es el único responsable de actualizar el
inventario, generar el comprobante PDF y disparar las notificaciones al Jefe de Bodega
y al Cliente, garantizando trazabilidad completa de cada operación.
Componente
de
Comprobant
es
notifica jefe de
bodega y cliente
Consulta
inventario
Lee
inventario
bodega
Logistock Solutions
Software Architecture Description – C4 Model
Curso: Ingeniería de software III
2.4 Código (N4)
2.4.1 Estructura del repositorio y módulos
El sistema se implementa en dos módulos principales alineados con el
Nivel 2 (Contenedores): una aplicación móvil Android (Typescript) como
canal del cliente y un Backend en Node + Typescript que centraliza la
lógica de negocio e integraciones externas.
Estructura (árbol):
/LogiStock-Solutions/
/LogiStock_front/
/app/
/src/main/
/java/com/logistock/client/
/ui/ (Activities/Fragments)
/viewmodel/ (lógica de presentación)
/network/ (API client, requests)
/model/ (DTOs y modelos)
/util/ (helpers, constantes)
/res/
/layout/ (XML layouts)
/drawable/
/values/
/mipmap/
build.gradle
/backend/
/src/
tsconfig
app
/config/
/interfaces/
/controllers/ (APIs REST: Auth, Orders, History, Restaurants)
/services/ (reglas de negocio: AuthService, rentalApplicationService, movementService)
/repositories/ (acceso a datos: userRepository, rentalRepository)
/models/ (Entities JPA: User, Warehouse, RentalApplication, etc.)
/middlewares/(PaymentGatewayAdapter,NotificationClient, StatementStoreClient*)
/routes/ (SecurityConfig*, configuración general)
/utils/
.
Logistock Solutions
Software Architecture Description – C4 Model
Curso: Ingeniería de software III
2.4 Código (N4)
2.4.2 Trazabilidad paquetes/Clases
Para garantizar consistencia entre arquitectura y código, los
componentes del Nivel 3 se evidencian en los siguientes módulos:
Elemento N3 Código (paquete/clase) Responsabilidad
API de Inicio
de Sesión
...controller.AuthController Expone endpoints de
autenticación.
Componente
de Seguridad
...service.AuthService +
...config.SecurityConfig
Valida credenciales,
gestiona sesión/token y
protege endpoints.
API de
Restaurantes
y Menús
...controller.RestaurantControl
ler
Expone consulta de
restaurantes y menús.
API de
Gestión de
Pedidos
...controller.rentalApplicationController Expone
creación/confirmación
de pedidos.
Componente
de Pedidos
...service.rentalApplicationService Reglas del pedido,
estados, coordinación de
pago y notificaciones.
API de
Historial de
Pedidos
...controller.movementController Expone historial, estado y
tiempo estimado del
pedido.
Componente
de Historial y
Facturas
...service.movementService Consulta historial y
gestiona
recibos/facturas.
Componente
de
Notificacione
s
...service.NotificationService Dispara y gestiona
notificaciones al cliente.
Adaptador
de Pasarela
de Pagos
...integration.PaymentGatewa
yAdapter
Encapsula integración
con pasarela externa.
Persistencia
de Usuarios
...repository.userRepository CRUD y consultas de
usuarios/sesiones.
Persistencia
de Pedidos
...repository.rentalRepository CRUD y consultas de
pedidos/estados.
Persistencia
de Historial
...repository.rentalRepository
(o HistoryRepository si existe)
Consulta histórica de
pedidos y estados.
Statement
Store (PDFs)
(si aplica)
...integration.StatementStore
Client
Manejo de
recibos/facturas en PDF
(S3 u objeto).
Logistock Solutions
Software Architecture Description – C4 Model
Curso: Ingeniería de software III
3. DECISIONES DE ARQUITECTURA (ADRs)
ADR-01: Canal unificado mediante aplicación híbrida web/móvil
● Decisión: mplementar una única aplicación híbrida usando React
(TypeScript) + Onsen UI que funcione tanto en web como en móvil
para todos los actores.
● Contexto: odos los actores (Cliente, Jefe de Bodega,
Administrador, Auxiliar) necesitan acceso desde dispositivos
móviles y escritorio.
● Alternativas: Apps nativas separadas por plataforma; app web
responsive sin capacidades móviles.
● Justificación: Reduce costos de desarrollo al mantener una sola
base de código, garantizando experiencia nativa en móvil y web
simultáneamente.
● Consecuencias: Se debe garantizar compatibilidad de
componentes Onsen UI con todos los roles y gestionar un único
ciclo de despliegue.
ADR-02: Backend centralizado como API REST
● Decisión: Implementar un Backend API independiente expuesto
como servicios REST sobre HTTPS.
● Contexto: La app híbrida debe consumir funcionalidades de
autenticación, inventario, solicitudes, pagos y notificaciones
desde un único punto.
● Alternativas: Backend monolítico con UI server-side; GraphQL;
gRPC.
● Justificación: REST es simple, ampliamente soportado y facilita la
separación cliente/servidor para todos los actores del sistema.
● Consecuencias: Se deben versionar endpoints, documentar
contratos y manejar errores de red.
ADR-03: Tecnología del backend: Node.js + Express + TypeScript
● Decisión: Desarrollar el backend en Node.js con Express y
TypeScript.
● Contexto: Se requiere un framework ágil para construir APIs REST,
integrar seguridad y conectarse con PostgreSQL e integraciones
externas.
● Alternativas: Java + Spring Boot; Python + Django; .NET.
● Justificación: Node.js + Express ofrece alto rendimiento para
operaciones I/O intensivas como gestión de inventario en tiempo
real. TypeScript añade tipado estático que mejora mantenibilidad.
● Consecuencias: Se debe gestionar la asincronía correctamente y
configurar TypeScript para todo el proyecto.
Logistock Solutions
Software Architecture Description – C4 Model
Curso: Ingeniería de software III
3. DECISIONES DE ARQUITECTURA (ADRs)
ADR-04: Persistencia transaccional en PostgreSQL
● Decisión: Usar PostgreSQL como base de datos principal para
usuarios, bodegas, inventario, solicitudes y movimientos.
● Contexto: Se manejan entidades transaccionales con relaciones
complejas y necesidad de consistencia, especialmente en
movimientos de inventario.
● Alternativas: MySQL; NoSQL (MongoDB); archivos planos.
● Justificación: PostgreSQL ofrece integridad referencial, soporte
avanzado de consultas y mejor manejo de transacciones
concurrentes que MySQL, crítico para el control de inventario en
tiempo real.
● Consecuencias: Requiere diseño cuidadoso del esquema, índices
y manejo de migraciones.
ADR-05: Acceso a datos mediante ORM con Sequelize
● Decisión: Encapsular el acceso a datos en una capa de
repositorio usando Sequelize como ORM.
● Contexto: Evitar SQL directo en controladores y mantener
separación de responsabilidades entre capas.
● Alternativas: ISQL directo; TypeORM; Prisma.
● Justificación: Sequelize es maduro, compatible con PostgreSQL y
se integra bien con Node.js + TypeScript, mejorando
mantenibilidad y facilitando migraciones.
● Consecuencias: Curva de aprendizaje y necesidad de optimizar
consultas complejas de inventario.
ADR-06: Almacenamiento de Documentos en Base de Datos
● Decisión: Almacenar los documentos (recibos, facturas, contratos) como binarios o referencias locales en la base de datos PostgreSQL.
● Contexto: Cada actor genera documentos con diferente naturaleza. Inicialmente se consideró S3, pero no aportaba valor al alcance real ni costo.
● Alternativas: Buckets AWS S3; almacenamiento local del servidor en carpeta /uploads.
● Justificación: Centralizar los datos y documentos en la misma base de datos o volumen local simplifica el despliegue y ahorra costos operativos.
● Consecuencias: Se debe gestionar el peso de la base de datos y hacer respaldos regulares.

ADR-07: Integración de pagos a través de adaptador en el
backend
● Decisión: Integrar la Pasarela de Pagos desde el backend
mediante un PaymentGatewayAdapter.
● Contexto: Los pagos de planes de alquiler son un sistema externo
y deben gestionarse de forma segura y centralizada, sin exponer
credenciales al cliente.
● Alternativas: Integrar pagos desde la app híbrida; acoplar lógica
de pagos directamente en controladores.
● Justificación: Reduce acoplamiento al proveedor de pagos,
centraliza validaciones y evita exponer detalles sensibles en el
frontend.
● Consecuencias: Dependencia del servicio externo; se deben
manejar timeouts, reintentos y fallos de transacción.
ADR-08: Notificaciones externalizadas con servicio dedicado
● Decisión: Centralizar el envío de notificaciones en un
NotificationService que consume un servicio externo de correo y
push.
● Contexto: Múltiples actores deben recibir notificaciones según
eventos: solicitudes aprobadas, movimientos completados,
alertas de seguridad.
● Alternativas: Enviar notificaciones desde múltiples módulos;
notificar sólo desde la app.
● Justificación: Unifica la lógica de notificación, facilita cambiar de
proveedor sin reescribir el sistema y garantiza que las
notificaciones lleguen al actor correcto según el evento.
● Consecuencias: Necesidad de manejo de reintentos, registro de
fallos y definición clara de destinatarios por tipo de evento.
ADR-09: Control de acceso basado en roles
● Decisión: Implementar control de acceso basado en roles con
cuatro perfiles: Cliente, Jefe de Bodega, Administrador y Auxiliar.
● Contexto: Cada actor tiene responsabilidades y permisos
distintos, un Auxiliar no puede aprobar solicitudes, un Cliente no
puede ver datos de otros clientes.
● Alternativas: Control de acceso por usuario individual; permisos
hardcodeados por endpoint.
● Justificación: Garantiza separación de responsabilidades, facilita
agregar nuevos roles en el futuro y centraliza la lógica de
permisos en el SecurityConfig.
● Consecuencias: Se deben definir y mantener las matrices de
permisos por rol y revisar cada endpoint.
Logistock Solutions
Software Architecture Description – C4 Model
Curso: Ingeniería de software III
3. DECISIONES DE ARQUITECTURA (ADRs)
ADR-10: Autenticación centralizada con JWT
● Decisión: Gestionar autenticación mediante tokens JWT
generados y validados en el backend.
● Contexto: La app híbrida necesita mantener sesiones seguras
para todos los actores sin estado en el servidor.
● Alternativas: Sesiones con cookies server-side; OAuth2 externo;
autenticación básica.
● Justificación: JWT permite autenticación stateless, es compatible
con apps híbridas web/móvil y facilita la validación de roles en
cada request.
● Consecuencias: Se deben definir políticas de expiración de
tokens, manejo de refresh tokens y almacenamiento seguro en el
cliente.
ADR-11: Componente de Autorización independiente para
movimientos
● Decisión: Separar la lógica de aprobación de solicitudes en un
AuthorizationComponent dentro del servicio del Jefe de Bodega.
● Contexto: Las solicitudes de ingreso y retiro requieren validación
de negocio antes de ejecutarse — no basta con verificar el rol.
● Alternativas: Validar directamente en el controlador; delegar al
auxiliar sin aprobación previa.
● Justificación: Centralizar la lógica de autorización de
movimientos garantiza trazabilidad, evita movimientos no
autorizados y facilita auditoría.
● Consecuencias: Agrega una capa de procesamiento en el flujo
de solicitudes que debe ser eficiente para no afectar operaciones
en tiempo real.
ADR-12: Registro de logs transversal para auditoría
● Decisión: Implementar un LogComponent transversal que registre
la actividad de todos los actores, accesible únicamente por el
Administrador.
● Contexto: El sistema maneja datos sensibles de clientes,
inventario y pagos que requieren trazabilidad completa para
auditoría.
● Alternativas: Logs solo en archivos del servidor; sin sistema de
logs; logs por módulo independiente.
● Justificación: Un componente centralizado de logs garantiza
auditoría completa, detecta comportamientos anómalos y
cumple con buenas prácticas de seguridad empresarial.
● Consecuencias: Incrementa el volumen de escrituras en base de
datos; se debe definir política de retención y limpieza de logs.
Logistock Solutions
Software Architecture Description – C4 Model
Curso: Ingeniería de software III
3. DECISIONES DE ARQUITECTURA (ADRs)
ADR-13: Generación de documentos PDF en el backend y BD
● Decisión: Generar todos los documentos PDF desde el backend y almacenarlos estructuradamente en la BD local.
● Contexto: Cada actor genera documentos que deben persistirse.
● Alternativas: Generar en frontend; usar AWS S3.
● Justificación: Centralizar la generación asegura consistencia. Evitar S3 reduce dependencias en la nube.
● Consecuencias: Elección de librería (PDFKit) y carga al servidor propio.

ADR-14: Arquitectura en capas para el backend
● Decisión: Organizar el backend en capas bien definidas:
Controller, Service, Repository , Database.
● Contexto: El sistema tiene múltiples actores, procesos y reglas de
negocio que deben mantenerse separados para facilitar
desarrollo y pruebas.
● Alternativas: Arquitectura monolítica sin capas; microservicios
por actor.
● Justificación: La arquitectura en capas es coherente con el
modelo C4, facilita la trazabilidad entre N3 y N4, y permite que
cada desarrollador trabaje en una capa sin afectar las demás.
● Consecuencias: Requiere disciplina en el equipo para no saltarse
capas y mantener responsabilidades claras.
ADR-15: Planes de alquiler con modalidad mensual y anual
● Decisión: Implementar dos modalidades de plan de alquiler —
mensual y anual, gestionadas desde el módulo de Configuración
del Administrador.
● Contexto: El negocio requiere flexibilidad para ofrecer distintos
precios y condiciones según la duración del contrato.
● Alternativas: Plan único sin modalidades; planes completamente
personalizados por cliente.
● Justificación: Dos modalidades estándar simplifican el desarrollo
inicial, cubren las necesidades del negocio y permiten al
Administrador ajustar tarifas sin modificar código.
● Consecuencias: Se debe implementar lógica de vencimiento de
contratos y notificaciones automáticas de renovación.
Logistock Solutions
Software Architecture Description – C4 Model
Curso: Ingeniería de software III
3. DECISIONES DE ARQUITECTURA (ADRs)
ADR-16: CI/CD con GitHub Actions
● Decisión: Implementar pipeline de integración y despliegue
continuo usando GitHub Actions.
● Contexto: El equipo necesita automatizar builds, pruebas y
despliegues para mantener calidad y velocidad de entrega..
● Alternativas: Jenkins; despliegue manual; GitLab CI.
● Justificación: GitHub Actions se integra nativamente con el
repositorio, es gratuito para proyectos académicos y sigue el flujo
Commit, Build, Test, Deploy ya definido en el documento.
● Consecuencias: Se deben definir los workflows de CI/CD y
configurar variables de entorno seguras para producción.
ADR-17: Despliegue de Infraestructura Simplificada
● Decisión: Usar servicios en la nube para el hosting de Base de Datos y Backend, sin depender de S3.
● Contexto: El sistema requiere infraestructura accesible desde la web.
● Alternativas: Servidor propio on-premise.
● Justificación: Facilidad de acceso y despliegue rápido de la API Node.js y la BD PostgreSQL.
● Consecuencias: Gestionar costos básicos del VPS o servicio PaaS elegido.


4. STACK TECNOLÓGICO DEL SISTEMA
En esta sección se describen las tecnologías utilizadas para la
implementación del sistema Logistock Solutions, organizadas por capa:
cliente móvil (frontend), backend y base de datos. Esta descripción es
coherente con la arquitectura presentada en los diagramas C4 y
corresponde al alcance definido para el rol del cliente.
