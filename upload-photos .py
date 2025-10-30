#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SCRIPT D'UPLOAD MULTIPLE - BLANCHOUD PHOTOGRAPHY
================================================

Ce script permet d'uploader plusieurs photos à la fois dans une galerie.
Il crée automatiquement les fichiers markdown nécessaires pour Netlify CMS.

UTILISATION:
1. Placez vos photos dans un dossier
2. Lancez ce script
3. Suivez les instructions
4. Les fichiers markdown sont créés automatiquement !

Author: Claude AI
Version: 1.0
"""

import os
import shutil
from datetime import datetime
from pathlib import Path
import re

# ===================================
# CONFIGURATION
# ===================================

GALERIES_DISPONIBLES = [
    "vaud",
    "italie",
    "france",
    "paris",
    "naples",
    "geneve",
    "grisons",
    "neuchatel",
    "bern"
]

EXTENSIONS_IMAGES = ['.jpg', '.jpeg', '.png', '.gif', '.webp']

# ===================================
# FONCTIONS UTILITAIRES
# ===================================

def creer_slug(texte):
    """
    Crée un slug URL-friendly à partir d'un texte.
    Exemple: "Mon Image.jpg" -> "mon-image"
    """
    # Enlever l'extension
    texte = os.path.splitext(texte)[0]
    # Minuscules
    texte = texte.lower()
    # Remplacer les accents
    replacements = {
        'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e',
        'à': 'a', 'â': 'a', 'ä': 'a',
        'ù': 'u', 'û': 'u', 'ü': 'u',
        'ô': 'o', 'ö': 'o',
        'î': 'i', 'ï': 'i',
        'ç': 'c'
    }
    for old, new in replacements.items():
        texte = texte.replace(old, new)
    # Garder seulement lettres, chiffres, espaces
    texte = re.sub(r'[^a-z0-9\s-]', '', texte)
    # Remplacer espaces par tirets
    texte = re.sub(r'[\s_]+', '-', texte)
    # Supprimer tirets multiples
    texte = re.sub(r'-+', '-', texte)
    # Enlever tirets début/fin
    texte = texte.strip('-')
    
    return texte or 'image'

def creer_contenu_markdown(nom_galerie, nom_fichier_image, titre="Sans titre", description="", prix=5250, edition="3/3 disponibles", format_photo="100 x 70 cm"):
    """
    Crée le contenu du fichier markdown pour une photo.
    """
    now = datetime.now().isoformat()
    
    # Capitaliser le nom de la galerie pour l'affichage
    nom_galerie_display = nom_galerie.capitalize()
    if nom_galerie == "geneve":
        nom_galerie_display = "Genève"
    elif nom_galerie == "neuchatel":
        nom_galerie_display = "Neuchâtel"
    
    contenu = f"""---
image: /images/uploads/{nom_fichier_image}
title: {titre}
description: {description}
price: {prix}
edition: {edition}
format: {format_photo}
galerie: {nom_galerie_display}
date: {now}
---
"""
    return contenu

def afficher_banniere():
    """Affiche la bannière du script."""
    print("\n" + "="*60)
    print(" 📸  BLANCHOUD PHOTOGRAPHY - UPLOAD MULTIPLE  📸")
    print("="*60 + "\n")

def afficher_menu_galeries():
    """Affiche le menu de sélection des galeries."""
    print("Galeries disponibles:\n")
    for i, galerie in enumerate(GALERIES_DISPONIBLES, 1):
        nom_display = galerie.capitalize()
        if galerie == "geneve":
            nom_display = "Genève"
        elif galerie == "neuchatel":
            nom_display = "Neuchâtel"
        print(f"  {i}. {nom_display}")
    print()

def selectionner_galerie():
    """Permet à l'utilisateur de sélectionner une galerie."""
    afficher_menu_galeries()
    
    while True:
        try:
            choix = input("Choisissez une galerie (numéro): ")
            index = int(choix) - 1
            
            if 0 <= index < len(GALERIES_DISPONIBLES):
                galerie_choisie = GALERIES_DISPONIBLES[index]
                nom_display = galerie_choisie.capitalize()
                if galerie_choisie == "geneve":
                    nom_display = "Genève"
                elif galerie_choisie == "neuchatel":
                    nom_display = "Neuchâtel"
                
                print(f"\n✅ Galerie sélectionnée: {nom_display}\n")
                return galerie_choisie
            else:
                print("❌ Numéro invalide. Réessayez.\n")
        except ValueError:
            print("❌ Veuillez entrer un numéro.\n")

def selectionner_dossier_photos():
    """Demande à l'utilisateur le dossier contenant les photos."""
    print("📁 DOSSIER DES PHOTOS")
    print("-" * 60)
    print("Entrez le chemin du dossier contenant vos photos.")
    print("Exemple: C:\\Users\\Sylvain\\Photos\\Vaud")
    print("Ou simplement glissez le dossier ici.\n")
    
    while True:
        chemin = input("Chemin du dossier: ").strip().strip('"').strip("'")
        
        if os.path.isdir(chemin):
            # Compter les images
            images = [f for f in os.listdir(chemin) 
                     if os.path.splitext(f.lower())[1] in EXTENSIONS_IMAGES]
            
            if images:
                print(f"\n✅ {len(images)} image(s) trouvée(s) !\n")
                return chemin, images
            else:
                print(f"❌ Aucune image trouvée dans ce dossier.")
                print(f"   Extensions supportées: {', '.join(EXTENSIONS_IMAGES)}\n")
        else:
            print("❌ Dossier introuvable. Vérifiez le chemin.\n")

def confirmer_upload(galerie, nombre_images):
    """Demande confirmation avant l'upload."""
    nom_display = galerie.capitalize()
    if galerie == "geneve":
        nom_display = "Genève"
    elif galerie == "neuchatel":
        nom_display = "Neuchâtel"
    
    print("\n" + "="*60)
    print("📋 RÉCAPITULATIF")
    print("="*60)
    print(f"Galerie: {nom_display}")
    print(f"Nombre de photos: {nombre_images}")
    print(f"Prix par défaut: CHF 5'250")
    print(f"Format par défaut: 100 x 70 cm")
    print(f"Édition: 3/3 disponibles")
    print("\nLes titres et descriptions pourront être ajoutés plus tard dans le CMS.")
    print("="*60 + "\n")
    
    reponse = input("Confirmer l'upload ? (o/n): ").lower()
    return reponse in ['o', 'oui', 'y', 'yes']

def traiter_upload(galerie, dossier_photos, liste_images):
    """
    Traite l'upload des images:
    1. Copie les images dans /images/uploads/
    2. Crée les fichiers markdown dans /galeries/{galerie}/
    """
    print("\n🚀 UPLOAD EN COURS...\n")
    
    # Chemins de destination
    repertoire_script = Path(__file__).parent
    dossier_images_dest = repertoire_script / "images" / "uploads"
    dossier_galerie_dest = repertoire_script / "galeries" / galerie
    
    # Créer les dossiers si nécessaires
    dossier_images_dest.mkdir(parents=True, exist_ok=True)
    dossier_galerie_dest.mkdir(parents=True, exist_ok=True)
    
    succes = 0
    erreurs = 0
    
    for i, nom_image in enumerate(liste_images, 1):
        try:
            # Chemin source
            source = Path(dossier_photos) / nom_image
            
            # Créer un nom de fichier unique
            timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
            extension = os.path.splitext(nom_image)[1]
            nom_fichier_unique = f"{timestamp}-{i}{extension}"
            
            # Copier l'image
            destination_image = dossier_images_dest / nom_fichier_unique
            shutil.copy2(source, destination_image)
            
            # Créer le slug pour le markdown
            slug = creer_slug(nom_image)
            slug_unique = f"{slug}-{timestamp}-{i}"
            
            # Créer le contenu markdown
            contenu_md = creer_contenu_markdown(
                nom_galerie=galerie,
                nom_fichier_image=nom_fichier_unique,
                titre="Sans titre",
                description="",
                prix=5250,
                edition="3/3 disponibles",
                format_photo="100 x 70 cm"
            )
            
            # Sauvegarder le markdown
            fichier_md = dossier_galerie_dest / f"{slug_unique}.md"
            with open(fichier_md, 'w', encoding='utf-8') as f:
                f.write(contenu_md)
            
            print(f"  ✅ [{i}/{len(liste_images)}] {nom_image}")
            succes += 1
            
        except Exception as e:
            print(f"  ❌ [{i}/{len(liste_images)}] {nom_image} - Erreur: {str(e)}")
            erreurs += 1
    
    return succes, erreurs

def afficher_instructions_finales():
    """Affiche les instructions pour finaliser l'upload."""
    print("\n" + "="*60)
    print("📤 PROCHAINES ÉTAPES")
    print("="*60)
    print("\n1. Ouvrez GitHub Desktop")
    print("\n2. Vous verrez tous les nouveaux fichiers:")
    print("   - Images dans /images/uploads/")
    print("   - Fichiers markdown dans /galeries/{galerie}/")
    print("\n3. Écrivez un message de commit:")
    print('   Exemple: "Ajout de 10 photos dans galerie Vaud"')
    print("\n4. Cliquez sur 'Commit to main'")
    print("\n5. Cliquez sur 'Push origin'")
    print("\n6. Attendez 30-60 secondes")
    print("\n7. Allez sur votre CMS:")
    print("   https://sylvain-blanchoud.art/admin")
    print("\n8. Vos photos apparaissent dans la galerie ! 🎉")
    print("\n9. Vous pouvez maintenant ajouter les titres/descriptions")
    print("   quand vous aurez le temps.")
    print("\n" + "="*60 + "\n")

# ===================================
# FONCTION PRINCIPALE
# ===================================

def main():
    """Fonction principale du script."""
    try:
        afficher_banniere()
        
        # Étape 1: Sélectionner la galerie
        galerie = selectionner_galerie()
        
        # Étape 2: Sélectionner le dossier des photos
        dossier_photos, liste_images = selectionner_dossier_photos()
        
        # Étape 3: Confirmer
        if not confirmer_upload(galerie, len(liste_images)):
            print("\n❌ Upload annulé.\n")
            return
        
        # Étape 4: Traiter l'upload
        succes, erreurs = traiter_upload(galerie, dossier_photos, liste_images)
        
        # Étape 5: Résumé
        print("\n" + "="*60)
        print("✅ UPLOAD TERMINÉ !")
        print("="*60)
        print(f"Succès: {succes}")
        if erreurs > 0:
            print(f"Erreurs: {erreurs}")
        print("="*60)
        
        # Étape 6: Instructions finales
        afficher_instructions_finales()
        
    except KeyboardInterrupt:
        print("\n\n❌ Upload interrompu par l'utilisateur.\n")
    except Exception as e:
        print(f"\n❌ ERREUR: {str(e)}\n")
        print("Contactez le support si le problème persiste.")

if __name__ == "__main__":
    main()
    input("\nAppuyez sur Entrée pour fermer...")
