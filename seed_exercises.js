import { connectDB } from './config/db.js';
import mongoose from 'mongoose';
import ExerciceModel from './models/exerciceModel.js';
import dotenv from 'dotenv';

dotenv.config();

const exercises = [
  // PECHO
  { 
    name: "Press de Banca con Barra", muscle_group: "Pecho", secondary_muscle_groups: ["Tríceps", "Hombros"], mechanics: "compound", movement_pattern: "horizontal_push", equipment: ["Barra", "Banco"], difficulty: "medium",
    instructions: ["Tumbado sobre un banco plano, con la cabeza, la espalda y los pies bien apoyados en el suelo.", "Sujetar la barra simétricamente con un agarre algo más ancho que los hombros, con las palmas mirando hacia los pies.", "Se toma aire antes de bajar la barra hasta rozar la parte media del pecho, manteniendo los codos ligeramente separados del tronco.", "Se empuja verticalmente hasta la posición inicial y se expulsa el aire al terminar de subir."] 
  },
  { 
    name: "Press Inclinado con Mancuernas", muscle_group: "Pecho", secondary_muscle_groups: ["Tríceps", "Hombros"], mechanics: "compound", movement_pattern: "horizontal_push", equipment: ["Mancuernas", "Banco"], difficulty: "medium",
    instructions: ["Con el banco inclinado ligeramente, apoyar bien la espalda y los pies.", "Sujetar las mancuernas a los lados del pecho con las palmas mirando hacia adelante.", "Se inspira profundamente al inicio y se empujan las mancuernas hacia arriba hasta acercarlas entre sí.", "Se baja el peso con control y se expulsa el aire al finalizar el empuje."] 
  },
  { 
    name: "Press Declinado con Barra", muscle_group: "Pecho", secondary_muscle_groups: ["Tríceps"], mechanics: "compound", movement_pattern: "horizontal_push", equipment: ["Barra", "Banco"], difficulty: "medium",
    instructions: ["Tumbado boca arriba en un banco declinado, con las piernas sujetas en los rodillos.", "Se sujeta la barra por encima del pecho. Se toma aire y se inicia el descenso hasta tocar la parte inferior del pecho.", "Se empuja fuertemente hacia arriba y se suelta el aire al llegar a la cima."] 
  },
  { 
    name: "Aperturas con Mancuernas", muscle_group: "Pecho", secondary_muscle_groups: ["Hombros"], mechanics: "isolation", movement_pattern: "horizontal_push", equipment: ["Mancuernas", "Banco"], difficulty: "easy",
    instructions: ["Tumbado sobre un banco plano, sujetar las mancuernas por encima del pecho con las palmas mirándose entre sí y los codos ligeramente flexionados.", "Se inspira y se abren los brazos en forma de arco hacia los lados hasta notar el estiramiento en la zona pectoral.", "Se levantan de nuevo hacia el centro como si se diera un abrazo, expulsando el aire."] 
  },
  { 
    name: "Cruces en Polea Alta", muscle_group: "Pecho", secondary_muscle_groups: [], mechanics: "isolation", movement_pattern: "horizontal_push", equipment: ["Polea"], difficulty: "medium",
    instructions: ["De pie, situarse en el centro de las poleas colocadas por encima de la cabeza, sujetando las asas con las palmas hacia abajo.", "Dar un paso hacia adelante e inclinar el tronco ligeramente.", "Se inspira y se tiran de las asas hacia abajo y hacia el centro del abdomen.", "Se suelta el aire al terminar y se vuelve reteniendo el movimiento."] 
  },
  { 
    name: "Cruces en Polea Media", muscle_group: "Pecho", secondary_muscle_groups: [], mechanics: "isolation", movement_pattern: "horizontal_push", equipment: ["Polea"], difficulty: "medium",
    instructions: ["Colocar las poleas a la altura de los hombros y agarrar las asas con las palmas mirando hacia el frente.", "Se inspira, se infla el pecho y se empuja el peso paralelo al suelo hasta juntar ambas manos delante del cuerpo.", "Se expulsa el aire mientras se regresa a la posición abierta y estirada."] 
  },
  { 
    name: "Cruces en Polea Baja", muscle_group: "Pecho", secondary_muscle_groups: ["Deltoides Anterior"], mechanics: "isolation", movement_pattern: "horizontal_push", equipment: ["Polea"], difficulty: "medium",
    instructions: ["Con las poleas a nivel del suelo, agarrar las empuñaduras y dar un paso al frente.", "Se toma aire y se elevan ambos brazos cruzándolos al frente a la altura del cuello, focalizando la parte alta del pecho.", "Descender lentamente expulsando el aire para aguantar la bajada."] 
  },
  { 
    name: "Fondos en Paralelas (Dips)", muscle_group: "Pecho", secondary_muscle_groups: ["Tríceps", "Hombros"], mechanics: "compound", movement_pattern: "vertical_push", equipment: ["Peso Corporal", "Máquina"], difficulty: "hard",
    instructions: ["Apoyarse en las barras paralelas con los brazos extendidos. Inclinar el tronco hacia adelante para enfocar la zona pectoral.", "Se toma aire y se bajan los codos hasta que los hombros queden por debajo de estos.", "Se hace fuerza para elevar el cuerpo a la posición inicial y se suelta la respiración."] 
  },
  { 
    name: "Pec Deck (Máquina Contractora)", muscle_group: "Pecho", secondary_muscle_groups: [], mechanics: "isolation", movement_pattern: "horizontal_push", equipment: ["Máquina"], difficulty: "easy",
    instructions: ["Sentado con la espalda completamente pegada al respaldo de la máquina.", "Se sujetan los agarres a los lados del torso. Se inspira y se empujan o acercan los brazos hasta el centro del pecho.", "Retornar lentamente abriendo los brazos y exhalar el aire al finalizar."] 
  },
  { 
    name: "Pullover con Mancuerna", muscle_group: "Pecho", secondary_muscle_groups: ["Espalda"], mechanics: "isolation", movement_pattern: "horizontal_pull", equipment: ["Mancuernas", "Banco"], difficulty: "medium",
    instructions: ["Tumbado, apoyando únicamente la parte superior de la espalda sobre el banco, dejando colgar la cadera.", "Se sujeta una mancuerna con ambas manos por encima del pecho con los brazos casi rectos.", "Se toma gran cantidad de aire y se baja el peso por detrás de la cabeza, expandiendo el tórax.", "Al subir, se expulsa el aire."] 
  },
  { 
    name: "Flexiones de Brazo (Push-ups)", muscle_group: "Pecho", secondary_muscle_groups: ["Tríceps", "Hombros", "Core"], mechanics: "compound", movement_pattern: "horizontal_push", equipment: ["Peso Corporal"], difficulty: "easy",
    instructions: ["Tumbado boca abajo, apoyar las manos en el suelo a una distancia algo mayor que los hombros y sostenerse sobre las puntas de los pies.", "Se inspira mientras se flexiona para acercar el pecho al suelo sin arquear la espalda.", "Se empuja fuertemente hacia arriba y se expulsa el aire."] 
  },

  // ESPALDA
  { 
    name: "Dominadas", muscle_group: "Espalda", secondary_muscle_groups: ["Bíceps", "Antebrazo"], mechanics: "compound", movement_pattern: "vertical_pull", equipment: ["Barra de dominadas", "Peso Corporal"], difficulty: "hard",
    instructions: ["Colgado de la barra con las manos separadas más allá del ancho de los hombros y las palmas mirando hacia adelante.", "Se toma aire y se tira del cuerpo hacia arriba hasta que la barbilla supere la altura de la barra.", "Se desciende lentamente y se expulsa el aire de vuelta a la posición inicial."] 
  },
  { 
    name: "Dominadas Supinas (Chin-ups)", muscle_group: "Espalda", secondary_muscle_groups: ["Bíceps", "Antebrazo"], mechanics: "compound", movement_pattern: "vertical_pull", equipment: ["Barra de dominadas", "Peso Corporal"], difficulty: "hard",
    instructions: ["Colgado de la barra con un agarre a la anchura de los hombros y las palmas mirando hacia ti.", "Se inspira profundo y se tracciona para elevarse completamente por encima de las manos.", "Al descender paulatinamente, se expulsa la respiración."] 
  },
  { 
    name: "Remo con Barra", muscle_group: "Espalda", secondary_muscle_groups: ["Bíceps", "Lumbar"], mechanics: "compound", movement_pattern: "horizontal_pull", equipment: ["Barra"], difficulty: "medium",
    instructions: ["De pie, inclinar el tronco hacia el frente flexionando muy poco las rodillas, manteniendo la espalda firme y recta.", "Se sujeta la barra y se toma aire antes de tirar de ella hasta tocar la zona inferior del estómago.", "Se expulsa el aire al bajar la barra extendiendo los brazos por completo."] 
  },
  { 
    name: "Remo con Mancuerna a una Mano", muscle_group: "Espalda", secondary_muscle_groups: ["Bíceps"], mechanics: "compound", movement_pattern: "horizontal_pull", equipment: ["Mancuernas", "Banco"], difficulty: "medium",
    instructions: ["Se apoya una mano y una rodilla sobre un banco plano paralelo al suelo.", "Con el brazo libre colgando, se sujeta la mancuerna. Se inspira y se lleva el peso hacia la cadera doblando el codo.", "Se desciende nuevamente estirando el brazo y se suelta el aire."] 
  },
  { 
    name: "Jalón al Pecho", muscle_group: "Espalda", secondary_muscle_groups: ["Bíceps"], mechanics: "compound", movement_pattern: "vertical_pull", equipment: ["Polea"], difficulty: "easy",
    instructions: ["Sentado en la máquina ajustando firmemente las piernas en los rodillos.", "Se sujetan los extremos de la barra, se toma aire y se tira de ella desde arriba hacia la parte superior del pecho.", "Retornar controlando la resistencia de la máquina y expulsar el aire."] 
  },
  { 
    name: "Jalón al Pecho Agarre Estrecho (V-Bar)", muscle_group: "Espalda", secondary_muscle_groups: ["Bíceps"], mechanics: "compound", movement_pattern: "vertical_pull", equipment: ["Polea"], difficulty: "easy",
    instructions: ["Sentado con las piernas fijadas bajo los rodillos, utilizando un agarre cerrado triangular.", "Inspirar profundamente al comenzar el tirón llevándolo hasta rozar la parte media del pecho.", "Dejar estirar completamente los brazos hacia arriba durante el ascenso soltando el aire."] 
  },
  { 
    name: "Remo en Polea Baja (Gironda)", muscle_group: "Espalda", secondary_muscle_groups: ["Bíceps", "Espalda Media"], mechanics: "compound", movement_pattern: "horizontal_pull", equipment: ["Polea"], difficulty: "medium",
    instructions: ["Sentado en frente del sistema de polea inferior con las piernas ligeramente flexionadas.", "Sin balancear la espalda hacia atrás, inspirar y tirar del agarre hasta que las manos toquen el abdomen.", "Retornar hacia adelante evitando que la espalda se encorve, espirando lentamente."] 
  },
  { 
    name: "Remo T-Bar", muscle_group: "Espalda", secondary_muscle_groups: ["Bíceps", "Espalda Baja"], mechanics: "compound", movement_pattern: "horizontal_pull", equipment: ["Barra", "Máquina"], difficulty: "hard",
    instructions: ["Colocarse sobre la máquina inclinando el torso recto hacia adelante.", "Se inspira, y ayudándose del fuerte empuje de los brazos, se trae el peso hasta contacto con la caja torácica.", "Bajar la carga alargando toda la espalda para repetir, expulsando el reposo de aire."] 
  },
  { 
    name: "Pulldown con Brazos Rígidos", muscle_group: "Espalda", secondary_muscle_groups: ["Tríceps largo", "Serrato"], mechanics: "isolation", movement_pattern: "vertical_pull", equipment: ["Polea", "Cuerda"], difficulty: "easy",
    instructions: ["De pie, levemente alejado de la polea alta del cable superior.", "Manteniendo los codos rígidos permanentemente, traccionar acercando la barra a las piernas con un recorrido en arco tras inspirar.", "Acompañar la resistencia de vuelta a la cima exhalando el aire progresivamente."] 
  },
  { 
    name: "Hiperextensiones Lumbar", muscle_group: "Espalda Baja", secondary_muscle_groups: ["Glúteos", "Isquiotibiales"], mechanics: "isolation", movement_pattern: "hinge", equipment: ["Máquina", "Peso Corporal"], difficulty: "easy",
    instructions: ["Fijar los tobillos en el soporte de la máquina e inclinar el cuerpo hacia el suelo flexionando la cintura.", "Cruzar las manos en el pecho, tomar aire y enderezar el torso sin exceder la línea recta natural del cuerpo.", "Desvender poco a poco liberando los pulmones."] 
  },

  // PIERNAS / GLÚTEOS / GEMELOS
  { 
    name: "Sentadilla Libre", muscle_group: "Piernas", secondary_muscle_groups: ["Glúteos", "Core", "Lumbar"], mechanics: "compound", movement_pattern: "squat", equipment: ["Barra"], difficulty: "hard",
    instructions: ["De pie, con las piernas separadas a una anchura aproximada de los hombros y la barra acomodada arriba de la espalda.", "Se toma abundante aire y se desciende doblando las rodillas, cuidando de mantener el torso lo más erguido posible.", "Presionar firmemente contra el suelo para elevarse hasta la inicial, botando la respiración al final."] 
  },
  { 
    name: "Prensa de Piernas", muscle_group: "Piernas", secondary_muscle_groups: ["Glúteos"], mechanics: "compound", movement_pattern: "squat", equipment: ["Máquina"], difficulty: "medium",
    instructions: ["Tumbado en el sillón de la prensa, asegurar la zona más baja de la espalda asimilada a la colchoneta.", "Se retira el seguro del carro tomando oxígeno, se baja frenando la flexión de ambas rodillas hacia el pecho de forma segura.", "Propulsar el panel distendiendo piernas expeliendo aire, vigilando el tope para no encajar la rodilla rectamente."] 
  },
  { 
    name: "Peso Muerto Convencional", muscle_group: "Piernas", secondary_muscle_groups: ["Espalda Baja", "Glúteos", "Isquiotibiales"], mechanics: "compound", movement_pattern: "hinge", equipment: ["Barra"], difficulty: "hard",
    instructions: ["Postura agachada sujetando la barra descansando en el suelo, próxima a las empeines.", "Llenar toda la caja torácica para asegurar la columna. Se sube impulsándose de los talones e irguiendo la cadera al final.", "Espirar aire al bloquear en la posición más recta y luego restituir a ras de tierra."] 
  },
  { 
    name: "Peso Muerto Rumano (RDL)", muscle_group: "Piernas", secondary_muscle_groups: ["Isquiotibiales", "Glúteos"], mechanics: "compound", movement_pattern: "hinge", equipment: ["Barra", "Mancuernas"], difficulty: "medium",
    instructions: ["Iniciando ya de pie rectos, las piernas separadas y un ínfimo pliegue constante en las rodillas.", "Se inspira rechanzando las caderas hacia la espalda y deslizando el agarre pegado por la espinilla sintiendo detrás del muslo.", "Reponer de pie nuevamente basculando vientre adelante sin tirones."] 
  },
  { 
    name: "Zancadas (Lunges)", muscle_group: "Piernas", secondary_muscle_groups: ["Glúteos"], mechanics: "compound", movement_pattern: "lunge", equipment: ["Mancuernas", "Peso Corporal"], difficulty: "medium",
    instructions: ["Estando de pie sujetar dos mancuernas laterales. Se inspira profundo al trazar un paso extenso al frente.", "Se hunde el eje central doblando rodilla opuesta rozando el parqué sin impacto y se suelta viento interior.", "Alzar recuperando eje para acometer paso del otro pie."] 
  },
  { 
    name: "Sentadilla Búlgara", muscle_group: "Piernas", secondary_muscle_groups: ["Glúteos"], mechanics: "compound", movement_pattern: "lunge", equipment: ["Mancuernas", "Banco"], difficulty: "hard",
    instructions: ["De espalda al banco, descansar la cara alta del pie inactivo detrás y separar la pierna fuerte delantera.", "Retener aliento descendiendo sobre la pierna principal aguantando equilibrio firme.", "Subir utilizando músculo de empuje exhalando progresivo."] 
  },
  { 
    name: "Extensiones de Cuádriceps", muscle_group: "Piernas", secondary_muscle_groups: [], mechanics: "isolation", movement_pattern: "isolation_extension", equipment: ["Máquina"], difficulty: "easy",
    instructions: ["En máquina adaptada, apoyar respaldos y enganchar cara del tobillo inferior sobre rodillo rodante.", "Tras inspirar, proyectar hacia la horizontal las piernas activando la musculatura superior frontal muslo.", "Aflojar suavemente desinflando pecho retornando carga."] 
  },
  { 
    name: "Curl Femoral Tumbado", muscle_group: "Piernas", secondary_muscle_groups: ["Glúteos menores"], mechanics: "isolation", movement_pattern: "isolation_curl", equipment: ["Máquina"], difficulty: "easy",
    instructions: ["Tumbado boca abajo, acoplar piernas enganchando taloneras de mecanismo elástico o peso.", "Plegar ambas rodillas inspirando hasta sentir roces glúteos posteriores profundos.", "Devolver de manera pasiva pero tensionada tirantes de máquina final al descender y respirar normal."] 
  },
  { 
    name: "Hip Thrust con Barra", muscle_group: "Piernas", secondary_muscle_groups: ["Glúteos", "Isquiotibiales"], mechanics: "compound", movement_pattern: "hinge", equipment: ["Barra", "Banco"], difficulty: "medium",
    instructions: ["Apadrinar escapularios al sofá/banco perpendicular. Se emplaza un rodillo barra sobre pliegue cadenal.", "Con soporte pies paralelos coger bocanada y propulsarse hacia lo alto hasta aplanar mesa humana.", "Descender a fondo y respirar fuera del obstáculo concéntrico."] 
  },
  { 
    name: "Máquina Abductora Sentado", muscle_group: "Glúteos", secondary_muscle_groups: [], mechanics: "isolation", movement_pattern: "dynamic", equipment: ["Máquina"], difficulty: "easy",
    instructions: ["Tomar asiento ubicando caras exteriores de rodillas en topetes acolchados.", "Empujar en arco lateral para ampliar postura contra máquina y respirar hacia abductores finales.", "Plegar despacio con la exhalación asistiéndose mutuamente."] 
  },
  { 
    name: "Elevación de Gemelos de Pie", muscle_group: "Gemelos", secondary_muscle_groups: [], mechanics: "isolation", movement_pattern: "isolation_extension", equipment: ["Máquina", "Mancuernas", "Peso Corporal"], difficulty: "easy",
    instructions: ["Parado, se apoya únicamente la zona de almohadillado plantar manteniendo libre rango talones caída libre inferior.", "Tras tomar aire y desde caída máxima subir puntas hacia topes más altos posicionales bailarina.", "Dilatar movimiento soltando respirar al fondo del tope."] 
  },
  { 
    name: "Elevación de Gemelos Sentado", muscle_group: "Gemelos", secondary_muscle_groups: [], mechanics: "isolation", movement_pattern: "isolation_extension", equipment: ["Máquina"], difficulty: "easy",
    instructions: ["Asegurar plataforma de empuje a zona tobillera en postura reclinado máquina pantorrillas con 90 grados codo rodil.", "Ejecutar el ascenso talonar con carga a cuestas del muslo anterior tomando bocanada vital.", "Desaparecer rango exhalando natural."] 
  },
  
  // HOMBROS
  { 
    name: "Press Arnold", muscle_group: "Hombros", secondary_muscle_groups: ["Tríceps"], mechanics: "compound", movement_pattern: "vertical_push", equipment: ["Mancuernas", "Banco"], difficulty: "hard",
    instructions: ["Comenzar sentado sosteniendo las mancuernas a la altura del cuello con las palmas orientadas hacia ti.", "Se inspira, y mientras se empuja el peso paralelo hacia arriba, se rotan las muñecas hacia afuera de forma limpia.", "Finalizar la cumbre retenida exhalando el aire de golpe y descender haciendo proceso rotatorio inverso."] 
  },
  { 
    name: "Press Militar con Barra", muscle_group: "Hombros", secondary_muscle_groups: ["Tríceps"], mechanics: "compound", movement_pattern: "vertical_push", equipment: ["Barra"], difficulty: "hard",
    instructions: ["De pie, empuñando la larga barra fijada al ras del cuello. Se ancla firmemente la postura de pelvis bloqueada.", "Tomando profundo aire se extienden los brazos directos hacia corona del recinto asimilando empuje.", "Evacuar aire tras llegada y reponer pesaje de abajo hacia arranque sin golpe grueso clavicular."] 
  },
  { 
    name: "Elevaciones Laterales", muscle_group: "Hombros", secondary_muscle_groups: [], mechanics: "isolation", movement_pattern: "isolation_extension", equipment: ["Mancuernas"], difficulty: "easy",
    instructions: ["Firmes y portando equipaje ligero lateral piernas con la diminuta dobla codo interior.", "Inspiración previa deltoide general y aspa brazo exterior horizontalmente plano hombro sin inclinarse en balancines.", "Descender muy pausado vaciando tracto pulmonar inferior a punto neutro cadera natural."] 
  },
  { 
    name: "Elevaciones Frontales", muscle_group: "Hombros", secondary_muscle_groups: [], mechanics: "isolation", movement_pattern: "isolation_extension", equipment: ["Mancuernas"], difficulty: "easy",
    instructions: ["Elige postura parada. Sostén aparejos frente muslo adelantado palma viendo extremidades.", "Expander aire subiendo en línea recta a visión campo sin bascular riñón trasero.", "Caída en compresión respiratoria reposada fina muscular anterior hombro aislado base pura frontal continua base."] 
  },
  { 
    name: "Pec Deck Invertido (Pájaro)", muscle_group: "Hombros", secondary_muscle_groups: ["Espalda Superior"], mechanics: "isolation", movement_pattern: "horizontal_pull", equipment: ["Máquina"], difficulty: "easy",
    instructions: ["Acomódese montando la máquina contractora de pecho de forma inversa (cara al respaldo).", "Empuñar la asidera horizontal. En profunda toma de aire trazar empuje cruzado abriendo alas brazos parte trasera del habitáculo separador musculatura.", "Respirado libre reposando muelle contráctil de resistencia paralela media inicial pecho tope interno cerrado relajado."] 
  },
  { 
    name: "Remo al Cuello", muscle_group: "Hombros", secondary_muscle_groups: ["Trapecios", "Bíceps"], mechanics: "compound", movement_pattern: "vertical_pull", equipment: ["Barra", "Polea"], difficulty: "medium",
    instructions: ["Agarre superior ancho de carga colgante con brazos. Se aprieta núcleo de control estomacal base.", "Inspirar fuertemente dirigiendo codos al aire con alzamiento principal hasta tórax alto.", "Permitir relajación aliento retornando hasta posición colgada con brazos sin encogimiento basal inferior hombro bajo natural asimilado de peso plomado extendido final base."] 
  },

  // BÍCEPS
  { 
    name: "Curl de Bíceps con Barra", muscle_group: "Bíceps", secondary_muscle_groups: ["Antebrazo"], mechanics: "isolation", movement_pattern: "isolation_curl", equipment: ["Barra"], difficulty: "medium",
    instructions: ["De pie, coger fierro curvo recto fijando parte anterior manos visión cara cuerpo y brazos unidos pared lumbar base inicial estirada paralela inferior.", "Aireando zona, plegar el antebrazo sin ceder codo balanceos hasta encaje hombro anterior flexo.", "Estirar lentamente exhalando oxígeno total."] 
  },
  { 
    name: "Curl de Bíceps Alterno", muscle_group: "Bíceps", secondary_muscle_groups: [], mechanics: "isolation", movement_pattern: "isolation_curl", equipment: ["Mancuernas", "Banco"], difficulty: "medium",
    instructions: ["Apoyo dorsal banco algo inclinado para favorecer caída pesada brazos plomo laterales base sin obstruir caída elongación.", "A respiración completa, contraer un flanco de mancuerna hasta posición encogida lateral girando la mano.", "Cambiar brazo de modo cíclico en retorno aire progresivo."] 
  },
  { 
    name: "Curl Predicador (Banco Scott)", muscle_group: "Bíceps", secondary_muscle_groups: [], mechanics: "isolation", movement_pattern: "isolation_curl", equipment: ["Barra EZ", "Banco", "Máquina"], difficulty: "medium",
    instructions: ["Apoyar parte posterior de brazos en rampa banco asimilado asegurando postura sin levantar asiento interior fijamente alzado a pecho fijo.", "Alzar pesas con la doble mano espirando de inicio la resistencia interior codo aislada muscular.", "Control de descenso total tomando todo rango amplitud."] 
  },
  { 
    name: "Curl Martillo", muscle_group: "Bíceps", secondary_muscle_groups: ["Braquiorradial", "Antebrazo"], mechanics: "isolation", movement_pattern: "isolation_curl", equipment: ["Mancuernas"], difficulty: "easy",
    instructions: ["Fijar agarre con ambas manos con posiciones palmas mutuas de lado como si sostuvieses mazo neutro basal lateral pie firme.", "Inspirado, acercar pesa a frente hombro sin alteración muñeca plano.", "Retorno suave aflojado base exhalando."] 
  },
  { 
    name: "Curl Concentrado", muscle_group: "Bíceps", secondary_muscle_groups: [], mechanics: "isolation", movement_pattern: "isolation_curl", equipment: ["Mancuernas", "Banco"], difficulty: "easy",
    instructions: ["Sentado al banco orilla. Fija interior codo base brazo contra base ingle pierna anclaje humano puro impidiendo movimiento accesorio del hombro natural en ascensión concéntrico basal alzo interno.", "Respira estático elevatorio exhalatoria elongación vaciada sin golpe articular en rebote articular natural elongar."] 
  },

  // TRÍCEPS
  { 
    name: "Extensión de Tríceps en Polea", muscle_group: "Tríceps", secondary_muscle_groups: [], mechanics: "isolation", movement_pattern: "isolation_extension", equipment: ["Polea"], difficulty: "easy",
    instructions: ["Cara a la estructura del cable fijo superior asir soporte manos invertidas o paralela cuerda codos fijos adheridos en pecho costillar cerrado interior.", "Se toma bocado de aire estirando por completo la línea inferior empuje tricep general bajada base final exhalatoria base exterior y retorno ángulo paralelos."] 
  },
  { 
    name: "Press Francés", muscle_group: "Tríceps", secondary_muscle_groups: [], mechanics: "isolation", movement_pattern: "isolation_extension", equipment: ["Barra EZ", "Banco"], difficulty: "medium",
    instructions: ["Decúbito al banco liso sin empuje cervical basal. Brazos dirigidos paralelos al hombro cielo visual fijados.", "Coger aire encogiendo la masa cayendo cerca frente por atrás coronilla libre nuca.", "Ascender de golpe elástico extendiendo aire pulmones exterior sin ceder de hombro oscilante vertical absoluto recto bloqueo natural."] 
  },
  { 
    name: "Fondos para Tríceps en Banco", muscle_group: "Tríceps", secondary_muscle_groups: ["Hombros"], mechanics: "compound", movement_pattern: "vertical_push", equipment: ["Banco", "Peso Corporal"], difficulty: "easy",
    instructions: ["Asentar palmas atrás culo banco pierna proyectar anterior libre horizontal. Coger aliento.", "Encerrojarse bajar peso paralelos codos asimilado rectos rozes plomada codo de flanco hundido posterior.", "Remontar base exhalando fuerza extensión global pura codo ascendencia inicial original tope estirado paralelo recto."] 
  },
  { 
    name: "Patada de Tríceps", muscle_group: "Tríceps", secondary_muscle_groups: [], mechanics: "isolation", movement_pattern: "isolation_extension", equipment: ["Mancuernas", "Banco"], difficulty: "easy",
    instructions: ["Flexión alzada de cintura cuerpo paralelo asimilado apoyado mano libre. Anclado codo base horizontal tronco de brazo trasero inamovible anterior 90º ángulo basal interior de empuje peso libre colgante en flexo.", "Aire reteniéndose propulsión hacia la extensión prolongada superior expulsando gas en retroceso inercial natural relajado inicial anterior ángulo interior 90º base natural."] 
  },

  // ABDOMEN / CORE
  { 
    name: "Crunch Abdominal", muscle_group: "Abdomen", secondary_muscle_groups: [], mechanics: "isolation", movement_pattern: "core_stability", equipment: ["Peso Corporal"], difficulty: "easy", recordType: "time",
    instructions: ["Acomodo plano esteral base doblando pernera acorte lumbar. Se interponen manos sin enganchar cervical nuca posterior base cruz asimilado pecho.", "Suelta exhalación dura acortando estómago en alzado cabeza zona superior hombro exclusivamente zona de apoyo escápula tope asimilado isométrico compresión vientre puro duro centralizado abdomen encogido basal inferior frontal."] 
  },
  { 
    name: "Plancha Abdominal (Plank)", muscle_group: "Abdomen", secondary_muscle_groups: ["Hombros", "Core profundo"], mechanics: "isolation", movement_pattern: "core_stability", equipment: ["Peso Corporal"], difficulty: "medium", recordType: "time",
    instructions: ["Base apoyo antebrazo nivel clavícula piernas rectificadas tope punteras atrás. Mantenimiento tensión constante al respirar corto pulmonar basal superior fijando recto core sin pandear central lumbar.", "Se sostiene cronológico base abdominal profunda faja recta paralela asimilada de suelo nivel sin movimientos."] 
  },
  { 
    name: "Rueda Abdominal (Ab Wheel)", muscle_group: "Abdomen", secondary_muscle_groups: ["Espalda lumbar profunda"], mechanics: "compound", movement_pattern: "dynamic", equipment: ["Máquina", "Peso Corporal"], difficulty: "hard",
    instructions: ["Sujeción en rodillera base estirando en avance rueda eje interior alargando todo tórax al frente aguantando bocanada para soporte presión lumbar paralela inferior anterior extrema tope extensión de brazo asimilado largo máximo sin quiebre.", "Retorno exhalado arrastrando estómago y contracción base abdomen para enrollar centro core interior hasta descanso de muslo inicial base rectificado de vuelta a posición arrodillada posterior interior natural isométrico."] 
  }
];

async function seed() {
  try {
    await connectDB();
    console.log("Conectado a la BD");
    
    // Clear the DB to force a clean slate
    await mongoose.models.Exercice.deleteMany({});
    console.log("Se ha limpiado la colección antigua para insertar los nuevos datos enriquecidos.");

    for (const ex of exercises) {
      await mongoose.models.Exercice.create(ex);
      console.log(`Insertado: ${ex.name} [${ex.movement_pattern}]`);
    }
    
    console.log("Completado. Base de datos con nombres de ejercicios correctos y descripciones.");
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

seed();
