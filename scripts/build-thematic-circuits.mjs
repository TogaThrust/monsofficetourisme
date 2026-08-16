/**
 * Construit les parcours thématiques Mons :
 * - géocode les adresses manquantes (Nominatim, cache local)
 * - ordonne les POI (plus proche voisin + 2-opt)
 * - calcule distance/temps à pied via OSRM (rues, pas vol d'oiseau)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CACHE_PATH = path.join(__dirname, 'geocode-cache.json');
const OUT_PATH = path.join(__dirname, 'thematic-circuits-output.json');

const GP = { name: 'Grand-place', lat: 50.454579808644866, lng: 3.9524220403263812 };

const EXISTING = [
  { name: 'Grand-place', lat: 50.454579808644866, lng: 3.9524220403263812 },
  { name: 'Fontaine du Rouge Puits', lat: 50.453628008903834, lng: 3.951961787864278 },
  { name: 'Immeuble Blanc Lévrier', lat: 50.453772534698075, lng: 3.951968283240367 },
  { name: 'Immeuble Grand Place 31 34', lat: 50.45402908419432, lng: 3.9520117125054086 },
  { name: 'Office du Tourisme', lat: 50.454332323930124, lng: 3.9519001056141505 },
  { name: 'Hotel de la Couronne', lat: 50.45471175966851, lng: 3.952006398444242 },
  { name: 'Chapelle Saint Georges', lat: 50.45471175966851, lng: 3.952006398444242 },
  { name: 'Immeuble Grand Place 28 30', lat: 50.454252742069286, lng: 3.95182218330392 },
  { name: 'Immeuble Grand Place 14', lat: 50.4549077193539, lng: 3.9530742512487036 },
  { name: 'Theatre Royal', lat: 50.455088435635844, lng: 3.9527782815535875 },
  { name: 'Singe du Grand Garde', lat: 50.45479341981008, lng: 3.9522287968183654 },
  { name: 'Statue du Dragon', lat: 50.45486174989513, lng: 3.9523948301590033 },
  { name: 'Hotel de Ville', lat: 50.45480197949359, lng: 3.9523291160420824 },
  { name: 'Ropieur', lat: 50.4552766715153, lng: 3.9516281520958048 },
  { name: 'Gillis', lat: 50.45523995574261, lng: 3.9515074526948677 },
  { name: 'Mayeur', lat: 50.455324487363825, lng: 3.9515061115915167 },
  { name: 'Musee du Doudou', lat: 50.455800804770384, lng: 3.951295827448148 },
  { name: 'Conservatoire Royal', lat: 50.45533242618571, lng: 3.9531102152339916 },
  { name: 'Eglise Sainte Elisabeth', lat: 50.45579320306712, lng: 3.9540713255303084 },
  { name: 'Palais de Justice', lat: 50.456007696501025, lng: 3.954066871911111 },
  { name: 'Maison Losseau', lat: 50.456297266247596, lng: 3.9541878893517928 },
  { name: 'Maison Rue de Nimy 53', lat: 50.45698482279863, lng: 3.9551340820576497 },
  { name: 'Mundaneum', lat: 50.45768765748315, lng: 3.9554285341088704 },
  { name: 'Place du Parc', lat: 50.45814104455692, lng: 3.952449919866341 },
  { name: 'Chapelle des Visitandines', lat: 50.45822660707853, lng: 3.9532032245533664 },
  { name: 'Ancienne Caserne de Gendarmerie', lat: 50.458474801156015, lng: 3.953804853086013 },
  { name: 'Prison de Mons', lat: 50.460282324772635, lng: 3.95132051280756 },
  { name: 'Tour Valenciennoise', lat: 50.45851000481584, lng: 3.9586096297188416 },
  { name: 'Pavillons Caserne Cavalerie', lat: 50.4569789023066, lng: 3.9568526932670043 },
  { name: 'Tank Sherman', lat: 50.4502218530669, lng: 3.9567210154353565 },
  { name: 'Machine a Eau', lat: 50.450111161393, lng: 3.9570511495840104 },
  { name: 'Parc du Waux Hall', lat: 50.453376220854395, lng: 3.9636842090831714 },
  { name: 'Eglise Saint Nicolas', lat: 50.45405094040865, lng: 3.957145403476515 },
  { name: 'Chapelle du Belian', lat: 50.4538022570371, lng: 3.956448319121124 },
  { name: 'Marche aux Herbes', lat: 50.45275484906115, lng: 3.952962113722099 },
  { name: 'Maison Rue de la Couronne 20 22', lat: 50.452692695322405, lng: 3.951853689021925 },
  { name: 'Couvent des Soeurs Noires', lat: 50.449935410823635, lng: 3.9510910826221446 },
  { name: 'Carre des Arts', lat: 50.44984236696645, lng: 3.951631996613749 },
  { name: 'Anciens Abattoirs', lat: 50.448868020649556, lng: 3.951252380864973 },
  { name: 'Eglise Notre Dame de Messines', lat: 50.44790931503488, lng: 3.9489270866778243 },
  { name: 'Maison Rue de Bertaimont 17', lat: 50.44862127338843, lng: 3.9491893999667673 },
  { name: 'Maison Rue de Bertaimont 33', lat: 50.4481174614463, lng: 3.9489108650064604 },
  { name: 'Casemates', lat: 50.4478864571212, lng: 3.946668334870114 },
  { name: 'Bonne Maison de Bouzanton', lat: 50.450143988335235, lng: 3.9471077743255116 },
  { name: 'Chapelle du Beguinage', lat: 50.44970845892772, lng: 3.945005019101507 },
  { name: 'Tour du Val des Ecoliers', lat: 50.450793699510335, lng: 3.9414164544264634 },
  { name: 'Gare de Mons', lat: 50.45349764975374, lng: 3.9432988917169367 },
  { name: 'Statue Saint Georges', lat: 50.45485084642281, lng: 3.940742590987673 },
  { name: 'Lucie et les Papillons', lat: 50.453824422885354, lng: 3.9461175784737077 },
  { name: 'Collegiale Sainte Waudru', lat: 50.4536332075858, lng: 3.9480486070144583 },
  { name: 'Tresors de Sainte Waudru', lat: 50.4536332075858, lng: 3.9480486070144583 },
  { name: 'Le Car d Or', lat: 50.4536332075858, lng: 3.9480486070144583 },
  { name: 'Porte Rue Courte', lat: 50.45337753189954, lng: 3.9502183989937514 },
  { name: 'Maison Espagnole', lat: 50.453649107984354, lng: 3.9497177767031606 },
  { name: 'Chapelle Saint Calixte', lat: 50.454085122149216, lng: 3.9491568209844417 },
  { name: 'Ancien Chateau Comtal', lat: 50.454349851935575, lng: 3.949287573282087 },
  { name: 'Tour Cesar', lat: 50.45461958758248, lng: 3.9493032062125204 },
  { name: 'Beffroi', lat: 50.45421851320321, lng: 3.9499785348899428 },
  { name: 'Square', lat: 50.452992572250096, lng: 3.949005645784526 },
  { name: 'Pilori', lat: 50.45311239629392, lng: 3.948201840885462 },
  { name: 'BAM', lat: 50.45561164910952, lng: 3.9525083177023212 },
];

const NEW_POIS = [
  // --- Famille / rues ---
  { name: "Rue d'Enghien", address: "Rue d'Enghien 19, 7000 Mons, Belgium", skipUnless: 'doudouMuseumOpen', desc: "Petite rue qui relie la Grand-Place au quartier du château. Si le musée du Doudou est ouvert, on la emprunte en sortant du musée vers la collégiale." },
  { name: 'Rue Cronque', address: 'Rue Cronque, 7000 Mons, Belgium', skipUnless: 'doudouMuseumOpen', desc: "Ruelle pavée qui mène vers le parc du Château, la chapelle Saint-Calixte et le beffroi." },
  { name: 'Rampe Sainte Waudru', address: 'Rampe Sainte-Waudru, 7000 Mons, Belgium', desc: "Rampe qui descend de la collégiale Sainte-Waudru vers la ville basse. On y trouve notamment la fresque Alegoría de Santa Valdetrudis." },
  { name: 'Rue de la Grosse Pomme', address: 'Rue de la Grosse Pomme, 7000 Mons, Belgium', desc: "Ruelle historique entre la collégiale et le square, au cœur du quartier canonial." },
  { name: 'Rue du Chapitre', address: 'Rue du Chapitre, 7000 Mons, Belgium', desc: "Rue du chapitre de Sainte-Waudru, entre la collégiale et le square Saint-Germain." },
  { name: 'Rue des Fripiers', address: 'Rue des Fripiers, 7000 Mons, Belgium', desc: "Rue commerçante qui relie la Grand-Place à la Grand'Rue, bordée de boutiques et de façades anciennes." },
  { name: 'Thanks Galerie', address: 'Rue des Fripiers 22, 7000 Mons, Belgium', desc: "Galerie d'art contemporain au 22 rue des Fripiers, au cœur des rues commerçantes." },
  { name: "Lask'Art", address: 'Rue des Fripiers 32, 7000 Mons, Belgium', desc: "Galerie Lask'Art, au 32 rue des Fripiers, dédiée à la création artistique." },
  { name: 'Rue de la Coupe', address: 'Rue de la Coupe, 7000 Mons, Belgium', desc: "Ancienne rue commerçante. On y trouve notamment l'enseigne À la Coupe d'Or, un ciboire sculpté." },
  { name: "Grand'Rue", address: "Grand'Rue 70, 7000 Mons, Belgium", desc: "Grande artère commerçante de Mons, entre la Grand-Place et le quartier de la gare." },
  { name: "Rue d'Havre", address: "Rue d'Havré, 7000 Mons, Belgium", desc: "L'une des plus anciennes rues commerçantes de Mons, particulièrement riche en enseignes de pierre." },

  // --- Art Est ---
  { name: 'Laurence Vray Instant suspendu', address: "Rue d'Enghien 19, 7000 Mons, Belgium", desc: "Fresque Instant suspendu de Laurence Vray (Belgique), rue d'Enghien 19. Un instant figé sur le mur, entre Grand-Place et beffroi." },
  { name: 'Atelier Pica Pica Panorama', address: 'Passage Victor Hugo, 7000 Mons, Belgium', desc: "Panorama d'Atelier Pica Pica (Belgique), dans le passage Victor Hugo. Une composition collective qui ouvre la perspective urbaine." },
  // overrides added below via COORD_OVERRIDES
  { name: "Hell'O Folks", address: 'Rue du 11 Novembre 8, 7000 Mons, Belgium', desc: "Folks, fresque de Hell'O (Belgique), rue du 11 Novembre 8. Univers onirique et figures hybrides." },
  { name: 'Kobra Torre de Saber', address: 'Rue du Mont du Parc, 7000 Mons, Belgium', desc: "Torre de Saber de Kobra (Brésil), rue du Mont du Parc. Une tour du savoir peinte monumentale." },
  { name: 'Andrea Ravo Mattoni Charles Quint', address: 'Boulevard Charles Quint 18, 7000 Mons, Belgium', lat: 50.45855, lng: 3.9548, desc: "Charles Quint d'Andrea Ravo Mattoni (Italie), boulevard Charles Quint 18. Réinterprétation picturale d'un portrait impérial." },
  { name: "Olivier Sonck Ivre d'histoires", address: 'Rue des Barbelés, 7000 Mons, Belgium', desc: "Ivre d'histoires d'Olivier Sonck (Belgique), sur les murs de la prison de Mons, rue des Barbelés." },
  { name: 'Zesar Bahamonte Le Dragon', address: 'Rue du Rossignol 14, 7000 Mons, Belgium', desc: "Le Dragon de Zësar Bahamonte (Espagne), rue du Rossignol 14. Le monstre du Lumeçon dans la ville." },
  { name: 'Zesar Bahamonte Saint Georges', address: 'Rue du Grand Jour 29, 7000 Mons, Belgium', desc: "Saint-Georges de Zësar Bahamonte (Espagne), rue du Grand Jour 29. Le saint sauveur face au dragon." },
  { name: 'Arts2 Tunnel de la Paix', address: 'Rue de la Croix-Rouge, 7000 Mons, Belgium', desc: "Tunnel de la Paix, réalisé par Arts² (Belgique) dans le tunnel de la rue de la Croix-Rouge." },
  { name: "Noir Artist Don't sleep on your dream", address: 'Rue de Nimy 121, 7000 Mons, Belgium', desc: "Don't sleep on your dream de Noir Artist (Belgique), rue de Nimy 121." },
  { name: 'Andrea Ravo Mattoni Rue de Nimy 126', address: 'Rue de Nimy 126, 7000 Mons, Belgium', desc: "Fresque d'Andrea Ravo Mattoni (Italie), rue de Nimy 126." },
  { name: 'Pierre Liebaert Je crois aux nuits', address: 'Rue de Nimy 106, 7000 Mons, Belgium', desc: "Je crois aux nuits de Pierre Liebaert (Belgique), rue de Nimy 106." },
  { name: 'Godmess Third Rua Storytelling', address: 'Rue de Nimy 90, 7000 Mons, Belgium', desc: "Storytelling de Godmess & Third Rua (Portugal), à l'entrée de l'école communale, rue de Nimy." },
  { name: 'Leonidas Giannakopoulos Global City', address: 'Rue de Nimy 73, 7000 Mons, Belgium', desc: "Global City de Leonidas Giannakopoulos (Grèce), rue de Nimy 73." },
  { name: 'Ufocinque Passeggiando nella Storia', address: 'Rue des Arbalestriers, 7000 Mons, Belgium', desc: "Passeggiando nella Storia d'Ufocinque (Italie), sur les murs des cours de justice, rue des Arbalestriers." },
  { name: 'Stelios Pupet Harmonizing Mons', address: 'Rue Antoine Clesse, 7000 Mons, Belgium', desc: "Harmonizing Mons de Stelios Pupet (Grèce), au croisement de la rue Antoine Clesse et de la rue du Gouverneur Maurice Damoiseaux." },
  { name: 'Jana et JS Le couple de la rue Verte', address: 'Rue de Nimy 42, 7000 Mons, Belgium', desc: "Le couple de la rue Verte de Jana & JS (France et Autriche), rue de Nimy 42." },
  { name: 'Lola Goies Rue du Miroir', address: 'Rue du Miroir 18, 7000 Mons, Belgium', desc: "Fresque de Lola Goies / Arts² (Belgique), rue du Miroir 18." },
  { name: "Eva Badalamenti Passage de l'ilot", address: "Passage de l'Îlot, 7000 Mons, Belgium", desc: "Fresque d'Eva Badalamenti / Arts² (Belgique), dans le passage de l'îlot." },

  // --- Art Sud ---
  { name: 'Blancbec Le monstrueux', address: "Rue d'Havré 95, 7000 Mons, Belgium", desc: "Le monstrueux de Blancbec (Belgique), rue d'Havré 95." },
  { name: "Oli-B L'escapade", address: 'Jardin Gustave Jacobs, 7000 Mons, Belgium', desc: "L'escapade d'Oli-B (Belgique), au jardin Gustave Jacobs." },
  { name: "Levalet L'homme des cavernes", address: 'Rue de Houdain 1, 7000 Mons, Belgium', desc: "L'homme des cavernes de Levalet (France), rue de Houdain 1. Un personnage collé au mur, comme sorti d'un autre temps." },
  { name: 'Farm Prod Rue de la Halle', address: 'Rue de la Halle 2, 7000 Mons, Belgium', desc: "Fresque de Farm Prod (Belgique), rue de la Halle 2." },
  { name: "Hell'O Rue de la Halle", address: 'Rue de la Halle 5, 7000 Mons, Belgium', desc: "Fresque de Hell'O (Belgique), rue de la Halle 5." },
  { name: 'Ilan Walbrecq Georges Cuvelier', address: 'Rue de la Halle 42, 7000 Mons, Belgium', desc: "Montois célèbres : Georges Cuvelier, par Ilan Walbrecq / Arts², rue de la Halle 42." },
  { name: 'Cedric Le Borgne La riviere', address: 'Marché aux Poissons, 7000 Mons, Belgium', desc: "La rivière de Cédric Le Borgne (France), au Marché-aux-Poissons." },
  { name: 'Andrea Buglisi La Gayole', address: 'Rue des Arquebusiers 3, 7000 Mons, Belgium', desc: "La Gayole d'Andrea Buglisi (Italie), rue des Arquebusiers 3." },
  { name: 'Thomas Istasse La lune de Malapert', address: 'Rue Malapert, 7000 Mons, Belgium', desc: "Montois célèbres : la lune de Malapert, par Thomas Istasse / Arts², au croisement de la rue de la Trouille et de la rue Malapert." },
  { name: 'Eva Badalamenti Louis Buisseret', address: 'Rue des Sœurs Noires 19, 7000 Mons, Belgium', desc: "Montois célèbres : Louis Buisseret, par Eva Badalamenti / Arts², rue des Sœurs Noires 19." },
  { name: 'Taquen Bouquet of memory and hope', address: 'Rue des Chartriers 2, 7000 Mons, Belgium', desc: "Bouquet of memory and hope de Taquen (Espagne), rue des Chartriers 2." },
  { name: 'Dussart Myncke True story Marche aux herbes', address: 'Marché aux Herbes, 7000 Mons, Belgium', desc: "True story de Calvin Dussart et Charles Myncke (Belgique), au Marché aux Herbes." },
  { name: 'Dussart Myncke True story Croix Place', address: 'Croix-Place, 7000 Mons, Belgium', desc: "True story de Calvin Dussart et Charles Myncke (Belgique), rue de Houdain / Croix-Place." },

  // --- Art Ouest ---
  { name: 'Duek Eldorado', address: 'Rue des Fripiers 19, 7000 Mons, Belgium', desc: "Eldorado de Duek (Espagne), rue des Fripiers 19." },
  { name: 'Poni Grand Rue', address: "Grand'Rue 8, 7000 Mons, Belgium", desc: "Fresque de Poni (Mexique), Grand'Rue 8." },
  { name: "Paul Segard Ma ville s'endort", address: 'Passage du Centre, 7000 Mons, Belgium', desc: "Ma ville s'endort de Paul Segard (Belgique), dans le Passage du Centre." },
  { name: 'Dulk The battle', address: 'Rue des Capucins 13, 7000 Mons, Belgium', desc: "The battle de Dulk (Espagne), rue des Capucins 13." },
  { name: 'Celeste Gangolphe Mille et une feuille', address: 'Rue des Capucins 40, 7000 Mons, Belgium', desc: "Mille et une feuille de Céleste Gangolphe (France), rue des Capucins 40." },
  { name: 'Nean Cybele et Poliade', address: 'Rue des Capucins 37, 7000 Mons, Belgium', desc: "Cybèle et Poliade de Nean (Belgique), rue des Capucins 37." },
  { name: 'Momo Rue Cantimpret', address: 'Rue Cantimpré 14, 7000 Mons, Belgium', desc: "Fresque de Momo (États-Unis), rue Cantimpré 14." },
  { name: 'Arkane Lalie', address: 'Rue de Bertaimont 55, 7000 Mons, Belgium', desc: "Lalie d'Arkane (France), rue de Bertaimont 55." },
  { name: 'Zmogk The elements', address: 'Rue des Cannoniers 18, 7000 Mons, Belgium', desc: "The elements de Zmogk (Russie), rue des Cannoniers 18." },
  { name: 'Tris Horizon', address: 'Boulevard Sainctelette 62, 7000 Mons, Belgium', desc: "Horizon de Tris (France), boulevard Sainctelette 62." },
  { name: 'Dourone Boulevard Sainctelette', address: 'Boulevard Sainctelette 76, 7000 Mons, Belgium', desc: "Fresque de Dourone (Espagne), boulevard Sainctelette 76." },
  { name: 'Daniel Eime Resistance', address: 'Boulevard Sainctelette 133, 7000 Mons, Belgium', desc: "Résistance de Daniel Eime (Portugal), boulevard Sainctelette 133." },
  { name: 'Nadege Dauvergne Place du Beguinage', address: 'Place du Béguinage 13, 7000 Mons, Belgium', desc: "Fresque de Nadège Dauvergne (France), place du Béguinage 13." },
  { name: "10eme ARTE L'envol des ballons", address: "Rue de l'Athénée 3, 7000 Mons, Belgium", desc: "L'envol des ballons de 10ème ARTE (Espagne), rue de l'Athénée 3." },
  { name: 'Arts2 Roland de Lassus', address: 'Rue des Cinq Visages, 7000 Mons, Belgium', desc: "Montois célèbres : Roland de Lassus, par les étudiants d'Arts² (Belgique), rue des Cinq Visages." },
  { name: 'Robert Montgomery Invisible graffiti of love', address: 'Place Léopold, 7000 Mons, Belgium', desc: "Invisible graffiti of love de Robert Montgomery (Royaume-Uni), place Léopold." },
  { name: 'Projeto Ruido Le temps', address: 'Rue Claude de Bettignies 19, 7000 Mons, Belgium', desc: "Le temps de Projeto Ruído (Portugal), rue Claude de Bettignies 19." },
  { name: 'Margaux Del Vecchio Anto Carte', address: 'Square Roosevelt 5, 7000 Mons, Belgium', desc: "Montois célèbres : Anto Carte, par Margaux Del Vecchio / Arts², square Roosevelt 5." },
  { name: 'Rachelle Celiane Santerre Jacques Du Broeucq', address: 'Rue du Chapitre 3, 7000 Mons, Belgium', desc: "Montois célèbres : Jacques Du Broeucq, par Rachelle & Céliane Santerre / Arts², rue du Chapitre 3." },
  { name: 'Andrea Ravo Mattoni Sainte Waudru et ses filles', address: 'Place du Chapitre 2, 7000 Mons, Belgium', desc: "Sainte Waudru et ses filles visitant les prisonniers, d'Andrea Ravo Mattoni (Italie), place du Chapitre 2." },
  { name: 'Ana Langeheldt Alegoria de santa Valdetrudis', address: 'Rampe Sainte-Waudru 4, 7000 Mons, Belgium', desc: "Alegoría de Santa Valdetrudis d'Ana Langeheldt (Espagne), rampe Sainte-Waudru 4." },
  { name: 'Filip Gilissen Spread your wings', address: 'Square Saint-Germain, 7000 Mons, Belgium', desc: "Spread your wings de Filip Gilissen (Belgique), square Saint-Germain." },
  { name: 'Nevercrew Dissipation', address: 'Rue à Degrés, 7000 Mons, Belgium', desc: "Dissipation de Nevercrew (Suisse), rue à Degrés." },

  // --- Bas-reliefs / enseignes ---
  { name: "A la Poire d'Or", address: 'Rue de Nimy 3, 7000 Mons, Belgium', lat: 50.455261, lng: 3.953044, desc: "Enseigne de pierre datée de 1789 : une poire suspendue à un ruban, en demi-relief Louis XVI. Au 3 rue de Nimy." },
  { name: 'Le Gros Maillet', address: 'Rue de Nimy 9, 7000 Mons, Belgium', lat: 50.455339, lng: 3.953233, desc: "Maillet sculpté au 9 rue de Nimy, ancienne enseigne de métier." },
  { name: 'The Bootle Arms', address: 'Rue de Nimy 14, 7000 Mons, Belgium', lat: 50.45545, lng: 3.95330, desc: "Blason rappelant le jumelage Mons–Bootle, au 14 rue de Nimy." },
  { name: 'Au Paradis', address: 'Rue de Nimy 25, 7000 Mons, Belgium', lat: 50.4555, lng: 3.9535, desc: "Ancienne enseigne du XVIIIe siècle, Au Paradis, au 25 rue de Nimy." },
  { name: 'IHS Rue de Nimy 71', address: 'Rue de Nimy 71, 7000 Mons, Belgium', lat: 50.4575, lng: 3.9553, desc: "Christogramme IHS avec les trois clous, au 71 rue de Nimy." },
  { name: 'A le Trois Brouet', address: 'Rue de Nimy 72, 7000 Mons, Belgium', lat: 50.45756, lng: 3.95539, desc: "À le Trois Brouet (1714) : trois brouettes sous une couronne, au 72 rue de Nimy." },
  { name: 'Saint-Pierre Rue de Nimy', address: 'Rue de Nimy 80, 7000 Mons, Belgium', lat: 50.457758, lng: 3.955472, desc: "Enseigne de saint Pierre sculptée au 80 rue de Nimy." },
  { name: 'Aux Trois Herrents', address: 'Rue de Nimy 83, 7000 Mons, Belgium', lat: 50.4578, lng: 3.9555, desc: "Aux Trois Herrents (1723) : trois harengs alignés en bas-relief, au 83 rue de Nimy." },
  { name: 'Armes de Mons Petit Marche', address: 'Rue de Nimy 83, 7000 Mons, Belgium', lat: 50.45785, lng: 3.95555, desc: "Blason de Mons sur une clé d'arc, cour du Petit Marché, derrière le 83 rue de Nimy." },
  { name: 'IHS dans un soleil', address: 'Rue de Nimy 89, 7000 Mons, Belgium', lat: 50.4580, lng: 3.9555, desc: "Christogramme IHS dans un soleil, motif religieux du XVIIIe siècle, au 89 rue de Nimy." },
  { name: 'La clé rouge', address: 'Rue de Nimy 96, 7000 Mons, Belgium', lat: 50.458131, lng: 3.955611, desc: "La clé rouge : grande clé sculptée au 96 rue de Nimy." },
  { name: 'Aux Trois Verts Chapeaux', address: 'Rue de Nimy 102, 7000 Mons, Belgium', lat: 50.45831, lng: 3.95570, desc: "Aux Trois Verts Chapeaux (1712) : trois chapeaux sculptés et peints, au 102 rue de Nimy." },

  { name: "A la Tette d'Or", address: "Rue d'Havré 15, 7000 Mons, Belgium", desc: "À la Tette d'Or, 15 rue d'Havré. Le motif de la tête a été buriné ; l'inscription subsiste." },
  { name: 'Le Lecteur Colas', address: "Rue d'Havré 35, 7000 Mons, Belgium", desc: "Le Lecteur, sculpture moderne de Colas posée en 1990 sur un ancien cartouche, au 35 rue d'Havré." },
  { name: "Au Lion d'Or", address: "Rue d'Havré 42, 7000 Mons, Belgium", desc: "Au Lion d'Or (1712), 42 rue d'Havré. Cartouche ancien ; le lion a disparu." },
  { name: 'Millesime MDCCXII', address: "Rue d'Havré 44, 7000 Mons, Belgium", desc: "Pierre millésimée MDCCXII (1712) au 44 rue d'Havré." },
  { name: "A la Clef d'Or", address: "Rue d'Havré 44, 7000 Mons, Belgium", desc: "À la Clef d'Or : clé ouvragée suspendue à un ruban, au 44 rue d'Havré." },
  { name: "A la Tasche d'Argent", address: "Rue d'Havré 48, 7000 Mons, Belgium", desc: "À la Tasche d'Argent, enseigne de pierre restaurée en 1934, au 48 rue d'Havré." },
  { name: "A la Lunette d'Or", address: "Rue d'Havré 50, 7000 Mons, Belgium", desc: "À la Lunette d'Or : binocle sculpté au 50 rue d'Havré." },
  { name: 'Au Renard', address: "Rue d'Havré 51, 7000 Mons, Belgium", desc: "Au Renard (1724) : renard courant en demi-relief, au 51 rue d'Havré." },
  { name: "A la Balance d'Or", address: "Rue d'Havré 53, 7000 Mons, Belgium", desc: "À la Balance d'Or (1768/1873) : balance sculptée au 53 rue d'Havré." },
  { name: "A la Paile d'Or", address: "Rue d'Havré 72, 7000 Mons, Belgium", desc: "À la Paile d'Or : pelle de boulanger entourée de végétaux, au 72 rue d'Havré." },
  { name: 'Au Corbeau', address: "Rue d'Havré 106, 7000 Mons, Belgium", desc: "Au Corbeau : oiseau sculpté sur la porte cochère du 106 rue d'Havré." },
  { name: "Pelles a enfourner 1573", address: "Rue d'Havré 114, 7000 Mons, Belgium", desc: "Deux pelles de boulanger croisées portant chacune trois pains (1573). Pierre retrouvée dans le sol puis replacée sous le porche du 114 rue d'Havré." },
  { name: "A la Faux d'Or", address: "Rue d'Havré 115, 7000 Mons, Belgium", desc: "À la Faux d'Or (1723) : faux sculptée au 115 rue d'Havré." },
  { name: 'A la Licorne', address: "Rue d'Havré 116, 7000 Mons, Belgium", desc: "À la Licorne : en réalité cheval et heaume des Franeau de Gommegnies, au 116 rue d'Havré." },
  { name: "La Croix d'Or Havre", address: "Rue d'Havré 117, 7000 Mons, Belgium", desc: "La Croix d'Or (1766) : croix aux extrémités fleurdelisées, au 117 rue d'Havré." },
  { name: "Au Mousqueton d'Or", address: "Rue d'Havré 122, 7000 Mons, Belgium", desc: "Au Mousqueton d'Or (1726) : mousqueton en demi-relief, au 122 rue d'Havré." },

  { name: 'A la Grande Rose', address: 'Rue de la Poterie 2, 7000 Mons, Belgium', desc: "À la Grande Rose / À la Montagne : magnifique rose sculptée, remploi du XVIe siècle, au 2 rue de la Poterie." },
  { name: "Au Pistolet d'Or", address: 'Rue du Hautbois 35, 7000 Mons, Belgium', lat: 50.453078, lng: 3.954630, desc: "Au Pistolet d'Or (1711) : pistolet en demi-relief, au 35 rue du Hautbois." },
  { name: "A l'Ecaille d'Or", address: 'Rue du Hautbois 22, 7000 Mons, Belgium', desc: "À l'Écaille d'Or (1750) : coquille reposant sur deux palmettes, au 22 rue du Hautbois." },
  { name: 'Fontaine Rue de Bertaimont', address: 'Rue de Bertaimont 31, 7000 Mons, Belgium', desc: "Fontaine à vasques en demi-relief, au 31 rue de Bertaimont." },
  { name: "A la Coupe d'Or", address: 'Rue de la Coupe 17, 7000 Mons, Belgium', desc: "À la Coupe d'Or : ciboire sculpté en haut-relief, au 17 rue de la Coupe." },
  { name: 'A Saint-Antoine', address: 'Rue de la Coupe 37, 7000 Mons, Belgium', desc: "À Saint-Antoine : saint Antoine, son cochon, une chapelle et des arbres, au 37 rue de la Coupe." },
  { name: 'Mortier et Pilon', address: 'Rue de Houdain 10, 7000 Mons, Belgium', desc: "Enseigne moderne Mortier et Pilon, posée vers 1995 au 10 rue de Houdain." },
  { name: 'Colombe du Saint-Esprit', address: 'Rue de Houdain 13, 7000 Mons, Belgium', desc: "Colombe en fonte dorée sur le balcon du 13 rue de Houdain." },
  { name: 'Au Paon et au Cygne', address: 'Rue des Fripiers 22, 7000 Mons, Belgium', desc: "Paon et cygne dans deux petits frontons, très discrets, au 22 rue des Fripiers." },
  { name: 'Chateau de le Marcote', address: 'Rue des Marcottes 33, 7000 Mons, Belgium', desc: "Château de le Marcote (1689) : trois belettes courant. La maison la plus étroite de Mons, au 33 rue des Marcottes." },
  { name: 'Cheval Dore', address: 'Rue du Parc 19, 7000 Mons, Belgium', desc: "Cheval sculpté sur la clé de l'entrée, au 19 rue du Parc." },
  { name: 'A la Bonne Femme', address: 'Rue Spira 6, 7000 Mons, Belgium', desc: "À la Bonne Femme (1723), enseigne déplacée de la rue Bertaimont, au 6 rue Spira." },
  { name: 'Armes de Mons Rue de la Clef', address: 'Rue de la Clef 4, 7000 Mons, Belgium', desc: "Armes de Mons au 4 rue de la Clef : seul vestige connu de l'ancienne Grande Boucherie." },
  { name: 'A la Tete Saint-Jean', address: 'Rue de la Clef 9, 7000 Mons, Belgium', desc: "À la Tête Saint-Jean : tête de saint Jean-Baptiste posée sur un plateau, au 9 rue de la Clef." },
  { name: 'Au Grand Laboureur', address: 'Rue de la Clef 30, 7000 Mons, Belgium', desc: "Au Grand Laboureur : inscription dans une allège du XVIIIe siècle, au 30 rue de la Clef." },
  { name: 'Blasons muets', address: 'Rue du Miroir 8, 7000 Mons, Belgium', desc: "Blasons muets (1545) : deux écus autour d'un phylactère daté, au 8 rue du Miroir." },
  { name: 'Au Gros Visage', address: 'Rue du Miroir 10, 7000 Mons, Belgium', desc: "Au Gros Visage (1789) : visage joufflu, ange ou allégorie du vent, au 10 rue du Miroir." },
  { name: '1582 4+W', address: 'Rue Masquelier 14, 7000 Mons, Belgium', desc: "Écu millésimé 1582, 4+W, au 14 rue Masquelier." },
  { name: 'St Franciscus Kring', address: 'Rue Masquelier 31, 7000 Mons, Belgium', desc: "St Franciscus Kring, ancienne Maison des Flamands, au 31 rue Masquelier." },
  { name: 'Cartouche et blason Grande Triperie', address: 'Rue de la Grande Triperie 13, 7000 Mons, Belgium', desc: "Mascaron, soleil, chiens-lions et écu, au 13 rue de la Grande Triperie." },
  { name: '16 IHS 93', address: 'Rue des Groseilliers 38, 7000 Mons, Belgium', desc: "Christogramme daté 1693, au 38 rue des Groseilliers." },
  { name: 'Croix plume et pinceau', address: 'Rue Terre-du-Prince 3, 7000 Mons, Belgium', desc: "Belle ferronnerie liée au chanoine Puissant : croix, plume et pinceau, au 3 rue Terre du Prince." },
  { name: 'Loge maconnique Rue Chisaire', address: 'Rue Chisaire 2, 7000 Mons, Belgium', desc: "Symboles maçonniques sur la façade du 2 rue Chisaire." },
  { name: "A la Croix d'Or Croix-Place", address: 'Croix-Place 3, 7000 Mons, Belgium', desc: "À la Croix d'Or (1936) : référence à l'ancienne croix qui marquait la juridiction d'Havré, 3 Croix-Place." },

  { name: "A la Ville d'Avesnes", address: "Grand'Rue 70, 7000 Mons, Belgium", desc: "À la Ville d'Avesnes (1724) : petite représentation d'Avesnes en bas-relief, au 70 Grand'Rue." },
  { name: 'Le Gant', address: "Grand'Rue 95, 7000 Mons, Belgium", desc: "Le Gant (1718) : gant sculpté au 95 Grand'Rue." },
  { name: 'A la Couronne Grand Rue', address: "Grand'Rue 102, 7000 Mons, Belgium", desc: "À la Couronne : couronne comtale en bas-relief, au 102 Grand'Rue." },
  { name: 'BF IHS IL', address: "Grand'Rue 104, 7000 Mons, Belgium", desc: "Christogramme BF IHS IL, cœur et trois clous, au 104 Grand'Rue." },
  { name: 'Portes du Theatre Royal', address: 'Grand-Place, 7000 Mons, Belgium', desc: "Portes en fonte du Théâtre Royal : médaillons de Molière, Racine, Grétry et Roland de Lassus, plus le blason de Mons." },
  { name: 'Bas-relief litterature montoise', address: 'Jardin du Mayeur, 7000 Mons, Belgium', lat: 50.455492, lng: 3.951122, desc: "Plaque de bronze de Gustave Jacobs dédiée aux créateurs de la littérature montoise : Henri Delmotte, J.-B. Descamps, Charles Letellier et Pierre Moutrieux." },
  { name: 'La Belle Plebeienne', address: 'Parc du Waux-Hall, 7000 Mons, Belgium', lat: 50.452961, lng: 3.964460, desc: "La Belle Plébéienne, bronze de René Harvent (1974), dans le parc du Waux-Hall." },
  { name: 'Buste de la reine Astrid', address: 'Parc du Waux-Hall, 7000 Mons, Belgium', lat: 50.453082, lng: 3.964647, desc: "Buste de la reine Astrid par Victor Rousseau. L'original a été volé en 2009 ; une copie a été installée en 2012." },
  { name: 'Cantoria Roland de Lassus', address: 'Rue du Chapitre, 7000 Mons, Belgium', lat: 50.453328, lng: 3.947002, desc: "Cantoria : monument à Roland de Lassus, trois chantres en bronze par Christian Leroy, inaugurés en 1970, rue du Chapitre." },
];

const TOURS = {
  famille: {
    label: 'Famille / essentiels',
    names: [
      'Grand-place', 'Hotel de Ville', 'Fontaine du Rouge Puits', 'Immeuble Grand Place 28 30',
      'Singe du Grand Garde', 'Statue du Dragon', 'Ropieur', 'Gillis', 'Mayeur', 'Musee du Doudou',
      "Rue d'Enghien", 'Rue Cronque', 'Chapelle Saint Calixte', 'Tour Cesar', 'Beffroi',
      'Maison Espagnole', 'Collegiale Sainte Waudru', 'Tresors de Sainte Waudru',
      'Rampe Sainte Waudru', 'Rue de la Grosse Pomme', 'Rue du Chapitre', 'Pilori', 'Square',
      'Rue des Fripiers', 'Thanks Galerie', "Lask'Art", 'Rue de la Coupe',
    ],
    keepOrder: true,
  },
  art_est: {
    label: "L'Art habite la ville — Est",
    names: [
      'Grand-place',
      'Laurence Vray Instant suspendu', 'Atelier Pica Pica Panorama', "Hell'O Folks",
      'Kobra Torre de Saber', 'Andrea Ravo Mattoni Charles Quint', "Olivier Sonck Ivre d'histoires",
      'Zesar Bahamonte Le Dragon', 'Zesar Bahamonte Saint Georges', 'Arts2 Tunnel de la Paix',
      "Noir Artist Don't sleep on your dream", 'Andrea Ravo Mattoni Rue de Nimy 126',
      'Pierre Liebaert Je crois aux nuits', 'Godmess Third Rua Storytelling',
      'Leonidas Giannakopoulos Global City', 'Ufocinque Passeggiando nella Storia',
      'Stelios Pupet Harmonizing Mons', 'Jana et JS Le couple de la rue Verte',
      'Lola Goies Rue du Miroir', "Eva Badalamenti Passage de l'ilot",
    ],
  },
  art_sud: {
    label: "L'Art habite la ville — Sud",
    names: [
      'Grand-place',
      'Blancbec Le monstrueux', "Oli-B L'escapade", "Levalet L'homme des cavernes",
      'Farm Prod Rue de la Halle', "Hell'O Rue de la Halle", 'Ilan Walbrecq Georges Cuvelier',
      'Cedric Le Borgne La riviere', 'Andrea Buglisi La Gayole', 'Thomas Istasse La lune de Malapert',
      'Eva Badalamenti Louis Buisseret', 'Taquen Bouquet of memory and hope',
      'Dussart Myncke True story Marche aux herbes', 'Dussart Myncke True story Croix Place',
    ],
  },
  art_ouest: {
    label: "L'Art habite la ville — Ouest",
    names: [
      'Grand-place',
      'Duek Eldorado', 'Poni Grand Rue', "Paul Segard Ma ville s'endort", 'Dulk The battle',
      'Celeste Gangolphe Mille et une feuille', 'Nean Cybele et Poliade', 'Momo Rue Cantimpret',
      'Arkane Lalie', 'Zmogk The elements', 'Tris Horizon', 'Dourone Boulevard Sainctelette',
      'Daniel Eime Resistance', 'Nadege Dauvergne Place du Beguinage', "10eme ARTE L'envol des ballons",
      'Arts2 Roland de Lassus', 'Robert Montgomery Invisible graffiti of love',
      'Projeto Ruido Le temps', 'Margaux Del Vecchio Anto Carte', 'Lucie et les Papillons',
      'Rachelle Celiane Santerre Jacques Du Broeucq', 'Andrea Ravo Mattoni Sainte Waudru et ses filles',
      'Ana Langeheldt Alegoria de santa Valdetrudis', 'Filip Gilissen Spread your wings',
      'Nevercrew Dissipation',
    ],
  },
  patrimoine: {
    label: 'Histoire / Patrimoine',
    names: [
      'Grand-place', 'Singe du Grand Garde', 'Statue du Dragon', 'Hotel de Ville',
      'Ropieur', 'Gillis', 'Mayeur', 'Collegiale Sainte Waudru', 'Le Car d Or',
      'Tresors de Sainte Waudru', 'Eglise Notre Dame de Messines', 'Eglise Sainte Elisabeth',
      'Eglise Saint Nicolas',
    ],
  },
  curiosites_nord: {
    label: 'Bas-reliefs — Nord (rue de Nimy)',
    names: [
      'Grand-place', 'Theatre Royal', 'Portes du Theatre Royal', 'Hotel de la Couronne',
      'Immeuble Blanc Lévrier', 'Singe du Grand Garde',
      "A la Poire d'Or", 'Le Gros Maillet', 'The Bootle Arms', 'Au Paradis',
      'IHS Rue de Nimy 71', 'A le Trois Brouet', 'Saint-Pierre Rue de Nimy',
      'Aux Trois Herrents', 'Armes de Mons Petit Marche', 'IHS dans un soleil',
      'La clé rouge', 'Aux Trois Verts Chapeaux',
      'Blasons muets', 'Au Gros Visage',
    ],
  },
  curiosites_est: {
    label: "Bas-reliefs — Est (rue d'Havré)",
    names: [
      'Grand-place',
      "A la Tette d'Or", 'Le Lecteur Colas', "Au Lion d'Or", 'Millesime MDCCXII',
      "A la Clef d'Or", "A la Tasche d'Argent", "A la Lunette d'Or", 'Au Renard',
      "A la Balance d'Or", "A la Paile d'Or", 'Au Corbeau', 'Pelles a enfourner 1573',
      "A la Faux d'Or", 'A la Licorne', "La Croix d'Or Havre", "Au Mousqueton d'Or",
      "Au Pistolet d'Or", "A l'Ecaille d'Or",
    ],
  },
  curiosites_sud: {
    label: 'Bas-reliefs — Sud',
    names: [
      'Grand-place',
      'A la Grande Rose', 'Fontaine Rue de Bertaimont', 'Mortier et Pilon',
      'Colombe du Saint-Esprit', 'Chateau de le Marcote', 'A la Bonne Femme',
      'Armes de Mons Rue de la Clef', 'A la Tete Saint-Jean', 'Au Grand Laboureur',
      '16 IHS 93', 'Croix plume et pinceau', "A la Croix d'Or Croix-Place",
    ],
  },
  curiosites_ouest: {
    label: 'Bas-reliefs — Ouest',
    names: [
      'Grand-place',
      "A la Coupe d'Or", 'A Saint-Antoine', 'Au Paon et au Cygne',
      "A la Ville d'Avesnes", 'Le Gant', 'A la Couronne Grand Rue', 'BF IHS IL',
      'Cheval Dore', 'St Franciscus Kring', 'Cartouche et blason Grande Triperie',
      'Loge maconnique Rue Chisaire', 'Cantoria Roland de Lassus',
      'Bas-relief litterature montoise',
    ],
  },
  commerces: {
    label: 'Rues commerçantes',
    names: [
      'Grand-place', 'Rue des Fripiers', 'Thanks Galerie', "Lask'Art", 'Rue de la Coupe',
      "Grand'Rue", 'Marche aux Herbes', "Rue d'Havre", 'Office du Tourisme',
    ],
  },
  complet: {
    label: 'Visite complète',
    // indices 1-based du parcours court actuel
    existingIndices: [1, 2, 8, 13, 11, 12, 14, 15, 16, 17, 61, 18, 19, 20, 21, 22, 23, 24, 25, 26, 28, 29, 33, 34, 35, 59, 60, 49, 50, 51, 52, 54, 53, 55, 57, 58, 1],
    keepOrder: true,
  },
};

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function haversine(a, b) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

function loadCache() {
  if (fs.existsSync(CACHE_PATH)) {
    return JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'));
  }
  return {};
}

function saveCache(cache) {
  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
}

async function geocode(address, cache) {
  if (cache[address]) return cache[address];
  const url =
    'https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' +
    encodeURIComponent(address);
  const res = await fetch(url, {
    headers: { 'User-Agent': 'CLQ-Mons-OT-parcours/1.0 (toga thrust)' },
  });
  if (!res.ok) throw new Error(`Nominatim ${res.status} for ${address}`);
  const json = await res.json();
  await sleep(1100);
  if (!json[0]) {
    console.warn('  ⚠ no geocode:', address);
    cache[address] = null;
    saveCache(cache);
    return null;
  }
  const hit = { lat: Number(json[0].lat), lng: Number(json[0].lon), display: json[0].display_name };
  cache[address] = hit;
  saveCache(cache);
  console.log('  ✓', address, '→', hit.lat.toFixed(5), hit.lng.toFixed(5));
  return hit;
}

function nearestNeighbor(points) {
  const start = points[0];
  const rest = points.slice(1);
  const ordered = [start];
  const pool = [...rest];
  while (pool.length) {
    const cur = ordered[ordered.length - 1];
    let bestI = 0;
    let bestD = Infinity;
    pool.forEach((p, i) => {
      const d = haversine(cur, p);
      if (d < bestD) {
        bestD = d;
        bestI = i;
      }
    });
    ordered.push(pool.splice(bestI, 1)[0]);
  }
  return ordered;
}

function twoOpt(points) {
  let route = points.slice();
  let improved = true;
  while (improved) {
    improved = false;
    for (let i = 1; i < route.length - 2; i++) {
      for (let k = i + 1; k < route.length - 1; k++) {
        const a = route[i - 1];
        const b = route[i];
        const c = route[k];
        const d = route[k + 1];
        const before = haversine(a, b) + haversine(c, d);
        const after = haversine(a, c) + haversine(b, d);
        if (after + 1 < before) {
          route = [...route.slice(0, i), ...route.slice(i, k + 1).reverse(), ...route.slice(k + 1)];
          improved = true;
        }
      }
    }
  }
  return route;
}

const COORD_OVERRIDES = {
  "Eva Badalamenti Passage de l'ilot": { lat: 50.45428, lng: 3.95322 }, // Passage de l'Îlot / rue de la Seuwe
  "Oli-B L'escapade": { lat: 50.45313, lng: 3.95769 }, // Jardin Gustave Jacobs, rue d'Havré
  'Momo Rue Cantimpret': { lat: 50.44972, lng: 3.94515 }, // Rue Cantimpret 14, près du Béguinage
  'Zmogk The elements': { lat: 50.44805, lng: 3.94655 }, // Rue des Canonniers, près des Casemates
  'Croix plume et pinceau': { lat: 50.45278, lng: 3.94833 }, // Rue Terre du Prince
  'Kobra Torre de Saber': { lat: 50.45822, lng: 3.95255 }, // École Saint-Stanislas, rue du Mont du Parc (Place du Parc)
  'Au Renard': { lat: 50.45378, lng: 3.95458 }, // 51 rue d'Havré, aligné sur les n°50-53
};

async function osrmPair(a, b) {
  const url = `https://router.project-osrm.org/route/v1/foot/${a.lng},${a.lat};${b.lng},${b.lat}?overview=false`;
  const res = await fetch(url, { headers: { 'User-Agent': 'CLQ-Mons-OT-parcours/1.0' } });
  if (!res.ok) throw new Error(`OSRM ${res.status}`);
  const json = await res.json();
  const route = json.routes && json.routes[0];
  if (!route) throw new Error('OSRM no route');
  return { meters: route.distance, seconds: route.duration };
}

async function osrmRoute(points) {
  let meters = 0;
  let seconds = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const bird = haversine(points[i], points[i + 1]);
    try {
      const r = await osrmPair(points[i], points[i + 1]);
      const speed = r.seconds > 0 ? r.meters / r.seconds : 99;
      // Si OSRM renvoie une vitesse trop élevée (profil auto), on revient à la durée piétonne.
      if (speed > 2.2) {
        meters += r.seconds * 1.25;
        seconds += r.seconds;
      } else if (r.meters > bird * 6 && bird < 400) {
        meters += bird * 1.35;
        seconds += (bird * 1.35) / 1.25;
      } else {
        meters += r.meters;
        seconds += r.seconds;
      }
    } catch {
      meters += bird * 1.35;
      seconds += (bird * 1.35) / 1.25;
    }
    await sleep(80);
  }
  return { meters, seconds };
}

function formatDuration(minutes) {
  const m = Math.max(15, Math.round(minutes / 5) * 5);
  const h = Math.floor(m / 60);
  const mm = m % 60;
  if (h === 0) return `${mm} min`;
  if (mm === 0) return `${h}h`;
  return `${h}h${String(mm).padStart(2, '0')}`;
}

function formatKm(meters) {
  const km = meters / 1000;
  if (km < 10) return `${km.toFixed(1).replace('.', ',')} km`;
  return `${Math.round(km * 10) / 10} km`.replace('.', ',');
}

async function main() {
  const cache = loadCache();
  const existingByName = Object.fromEntries(EXISTING.map((p) => [p.name, p]));

  console.log('Géocodage des nouveaux POI…');
  const resolvedNew = [];
  for (const poi of NEW_POIS) {
    const override = COORD_OVERRIDES[poi.name];
    let lat = override?.lat ?? poi.lat;
    let lng = override?.lng ?? poi.lng;
    if (lat == null || lng == null) {
      const hit = await geocode(poi.address, cache);
      if (hit) {
        lat = hit.lat;
        lng = hit.lng;
      } else {
        console.warn('  fallback skipped, will retry with Mons center offset');
        lat = GP.lat;
        lng = GP.lng;
      }
    }
    resolvedNew.push({ ...poi, lat, lng, audio: '' });
  }

  const allByName = { ...existingByName };
  for (const p of resolvedNew) allByName[p.name] = p;

  const missing = [];
  const tourResults = {};

  for (const [key, tour] of Object.entries(TOURS)) {
    let pts;
    if (tour.existingIndices) {
      pts = tour.existingIndices.map((i) => {
        const loc = EXISTING[i - 1];
        return { ...loc, _existingIndex: i };
      });
    } else {
      pts = tour.names.map((name) => {
        const p = allByName[name];
        if (!p) missing.push(`${key}:${name}`);
        return p;
      }).filter(Boolean);
      if (pts[0]?.name !== 'Grand-place') {
        pts = [allByName['Grand-place'], ...pts.filter((p) => p.name !== 'Grand-place')];
      }
      if (!tour.keepOrder) {
        const inner = twoOpt(nearestNeighbor(pts));
        pts = inner;
      }
      if (pts[pts.length - 1].name !== 'Grand-place') {
        pts = [...pts, allByName['Grand-place']];
      }
    }

    console.log(`OSRM ${key} (${pts.length} pts)…`);
    let meters = 0;
    let seconds = 0;
    try {
      const r = await osrmRoute(pts);
      meters = r.meters;
      seconds = r.seconds;
    } catch (err) {
      console.warn('  OSRM failed, pairwise fallback', err.message);
      for (let i = 0; i < pts.length - 1; i++) {
        try {
          const r = await osrmRoute([pts[i], pts[i + 1]]);
          meters += r.meters;
          seconds += r.seconds;
          await sleep(150);
        } catch {
          meters += haversine(pts[i], pts[i + 1]) * 1.35;
          seconds += (haversine(pts[i], pts[i + 1]) * 1.35) / 1.15;
        }
      }
    }

    const uniqueStops = pts.filter((p, i) => i === 0 || p.name !== pts[i - 1].name).length;
    const visitMin = uniqueStops * 3.5;
    const walkMin = seconds / 60;
    const totalMin = walkMin + visitMin;

    tourResults[key] = {
      label: tour.label,
      names: pts.map((p) => p.name),
      meters: Math.round(meters),
      walkMinutes: Math.round(walkMin),
      totalMinutes: Math.round(totalMin),
      kmLabel: formatKm(meters),
      timeLabel: formatDuration(totalMin),
      poiCount: uniqueStops,
    };
    console.log(
      `  ${key}: ${tourResults[key].kmLabel} — ${tourResults[key].timeLabel} (${uniqueStops} POI, marche ${Math.round(walkMin)} min)`
    );
    await sleep(200);
  }

  if (missing.length) {
    console.warn('POI manquants:', missing);
  }

  const output = {
    newPois: resolvedNew.map((p) => ({
      name: p.name,
      lat: p.lat,
      lng: p.lng,
      audio: '',
      skipUnless: p.skipUnless || undefined,
      desc: p.desc,
      address: p.address,
    })),
    tours: tourResults,
    missing,
  };
  fs.writeFileSync(OUT_PATH, JSON.stringify(output, null, 2));
  console.log('Écrit', OUT_PATH);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
