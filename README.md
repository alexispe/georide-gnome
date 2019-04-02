# GeoRide Gnome
![Logo GeoBobo](https://raw.githubusercontent.com/alexispe/georide-gnome/master/georide-logo.png)

> V à tous les motards de France et de Navarre utilisateurs de Gnome et possesseurs de GeoRide.
> Extension non officielle.

Ceci est une incroyable extension GNOME Shell qui va te permettre de communiquer avec ta moto comme par magie :
- Affiche l'état de verrouillage de ton tracker dans la status bar
- Affiche une incroyable popup te permettant de :
  - Voir le nombre de km de la moto
  - Localiser la moto sur google maps
  - Verrouiller/Déverrouiller la moto

![Demo Popup GeoBobo](https://raw.githubusercontent.com/alexispe/georide-gnome/master/georide-popup.png)

## Démarrage
Les instruction suivantes vont vous aider à installer ce projet sur votre pc. Si vous souhaitez participer au projet, rendez-vous dans la partie développement.

### Prérequis
Cette extension est développée pour l'environnement de bureau [Gnome](https://www.gnome.org/) et plus particulièrement l'interface graphique [Gnome Shell](https://doc.ubuntu-fr.org/gnome-shell). C'est l'interface par défaut d'Ubuntu depuis la version 17.10 (Artful Aardvark), et il était pré-installé sur la variante Ubuntu GNOME (version 16.04). 

### Installation
L'installation est simple, il vous suffit de récupérer les fichiers puis changer vos identifiants.

Récupérez des fichiers :
```
cd ~/.local/share/gnome-shell/extensions/
git clone https://github.com/alexispe/georide-gnome.git GeoRide@frenchco.de
```
Modifiez vos identifiants dans le fichier ```extension.js``` :
```
nano ~/.local/share/gnome-shell/extensions/GeoRide@frenchco.de/extension.js
```
Remplacez les champs :
```
const GEORIDE_EMAIL = 'grutier@gmail.com'
const GEORIDE_PASSWORD = 'helicoptere'
```
Bravo, maintenant vous n'avez plus qu'à activer l'extension.
Rendez vous dans l'interface de Gnome Tweak Tool (via la commande ```gnome-tweak-tool```) > onglet Extensions.
Ou directement sur cette page (https://extensions.gnome.org/local/).
Puis activez GeoRide.

## Contribution
Toute proposition d'amélioration est la bienvenue. Si vous rencontrez un problème ou souhaitez ajouter de nouvelles fonctionnalités, n'hésitez pas à envoyer une pull request.

## À faire
- [ ] Sauvegarder le token pour ne pas se reconnecter à chaque requête

🇫🇷 ✌️
