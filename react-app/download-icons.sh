#!/bin/bash

# Script pour télécharger les icônes officielles des réseaux sociaux et API

ICONS_DIR="public/icons"

# Créer le dossier des icônes s'il n'existe pas
mkdir -p $ICONS_DIR

echo "Téléchargement des icônes officielles..."

# Claude AI (Anthropic)
echo "Téléchargement de Claude AI..."
curl -s -L "https://www.anthropic.com/favicon.ico" -o "$ICONS_DIR/claude.ico" 2>/dev/null || echo "Claude icon non disponible"

# GPT-4 (OpenAI)
echo "Téléchargement de GPT-4..."
curl -s -L "https://www.openai.com/favicon.ico" -o "$ICONS_DIR/gpt4.ico" 2>/dev/null || echo "GPT-4 icon non disponible"

# Gemini (Google)
echo "Téléchargement de Gemini..."
curl -s -L "https://www.gstatic.com/gemini/favicon.ico" -o "$ICONS_DIR/gemini.ico" 2>/dev/null || echo "Gemini icon non disponible"

# ElevenLabs
echo "Téléchargement de ElevenLabs..."
curl -s -L "https://elevenlabs.io/favicon.ico" -o "$ICONS_DIR/elevenlabs.ico" 2>/dev/null || echo "ElevenLabs icon non disponible"

# Deepseek
echo "Téléchargement de Deepseek..."
curl -s -L "https://www.deepseek.com/favicon.ico" -o "$ICONS_DIR/deepseek.ico" 2>/dev/null || echo "Deepseek icon non disponible"

# Grok (X AI)
echo "Téléchargement de Grok..."
curl -s -L "https://x.ai/favicon.ico" -o "$ICONS_DIR/grok.ico" 2>/dev/null || echo "Grok icon non disponible"

# Kimi2 (Moonshot AI)
echo "Téléchargement de Kimi2..."
curl -s -L "https://kimi.moonshot.cn/favicon.ico" -o "$ICONS_DIR/kimi2.ico" 2>/dev/null || echo "Kimi2 icon non disponible"

# Twitter/X
echo "Téléchargement de Twitter/X..."
curl -s -L "https://abs.twimg.com/favicons/twitter.ico" -o "$ICONS_DIR/twitter.ico" 2>/dev/null || echo "Twitter icon non disponible"

# Facebook
echo "Téléchargement de Facebook..."
curl -s -L "https://static.xx.fbcdn.net/rsrc.php/yT/r/aGT3gskzWBf.ico" -o "$ICONS_DIR/facebook.ico" 2>/dev/null || echo "Facebook icon non disponible"

# LinkedIn
echo "Téléchargement de LinkedIn..."
curl -s -L "https://static.licdn.com/aero-v1/sc/h/al2o9zrvru7aqj8e1x2rzsrca" -o "$ICONS_DIR/linkedin.ico" 2>/dev/null || echo "LinkedIn icon non disponible"

# Instagram
echo "Téléchargement de Instagram..."
curl -s -L "https://www.instagram.com/static/images/ico/favicon.ico/36b3ee2d91ed.ico" -o "$ICONS_DIR/instagram.ico" 2>/dev/null || echo "Instagram icon non disponible"

# YouTube
echo "Téléchargement de YouTube..."
curl -s -L "https://www.youtube.com/favicon.ico" -o "$ICONS_DIR/youtube.ico" 2>/dev/null || echo "YouTube icon non disponible"

# TikTok
echo "Téléchargement de TikTok..."
curl -s -L "https://www.tiktok.com/favicon.ico" -o "$ICONS_DIR/tiktok.ico" 2>/dev/null || echo "TikTok icon non disponible"

# Pinterest
echo "Téléchargement de Pinterest..."
curl -s -L "https://www.pinterest.com/favicon.ico" -o "$ICONS_DIR/pinterest.ico" 2>/dev/null || echo "Pinterest icon non disponible"

# WhatsApp
echo "Téléchargement de WhatsApp..."
curl -s -L "https://web.whatsapp.com/favicon.ico" -o "$ICONS_DIR/whatsapp.ico" 2>/dev/null || echo "WhatsApp icon non disponible"

# Telegram
echo "Téléchargement de Telegram..."
curl -s -L "https://web.telegram.org/favicon.ico" -o "$ICONS_DIR/telegram.ico" 2>/dev/null || echo "Telegram icon non disponible"

# Discord
echo "Téléchargement de Discord..."
curl -s -L "https://discord.com/assets/favicon.ico" -o "$ICONS_DIR/discord.ico" 2>/dev/null || echo "Discord icon non disponible"

# Reddit
echo "Téléchargement de Reddit..."
curl -s -L "https://www.redditstatic.com/favicon.ico" -o "$ICONS_DIR/reddit.ico" 2>/dev/null || echo "Reddit icon non disponible"

echo "Téléchargement terminé ! Les icônes sont dans le dossier $ICONS_DIR"

# Vérifier les fichiers téléchargés
echo "Fichiers téléchargés :"
ls -la $ICONS_DIR/