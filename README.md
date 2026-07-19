# ♾️ Infinity OS

A gorgeous, highly interactive web-based Operating System (Web OS) simulator styled in a premium, ultra-modern macOS Sequoia/Sonoma theme. Built completely using Tailwind CSS, fluid animations, and robust mock integrations to bring a native desktop environment right to your browser.

---

## Preview

![Image Preview](/public/preview.png)

## ✨ Features

### 🍏 Premium macOS-Inspired UI/UX
* **Top Menu Bar:** Interactive Apple logo dropdown menu (About, Sleep, Restart, Shut Down), active application settings menus, and dynamic status indicators (Wi-Fi, Bluetooth).
* **Control Center:** Translucent drop-down dashboard featuring interactive volume and display brightness controls.
* **Dynamic Dock:** Centered dock at the bottom with high-end glassmorphism styling, magnification zoom transitions on hover, and active app notification dots.
* **Window Manager:** Fully draggable, resizable application windows featuring interactive macOS traffic-light buttons (Close, Minimize, Maximize) with layout depth indexing (focus states).

### ⚙️ Live System Integrations
* **Live Hardware Battery Sync:** Leverages the native Web Battery API (`navigator.getBattery()`) to sync and display your real computer's battery status and charging state instantly.
* **Live Theme Engine:** Instantly toggles global styles across four modes: *Dark Mode*, *Light Mode*, *Cyberpunk Neon*, and *Aesthetic Pastel*. Also auto-syncs with your host OS device preferences via media queries.
* **Animated Live Wallpaper:** Powered by a full-screen, looping HTML5 background (`dark-bg.mp4`) designed with a subtle contrast filter to ensure perfect visibility for desktop files and icons.

### 📂 File System & Native Path Mapping
* **Directory Navigator:** Built to structure and handle simulated paths mapping directly to your user folder:
  * `file:///C:/Users/Saurav/Documents/`
  * `file:///C:/Users/Saurav/Downloads/`
  * `file:///C:/Users/Saurav/Music/`
  * `file:///C:/Users/Saurav/Videos/`
* **Editable Navigation Bar:** Change the folder paths manually inside the Finder search bar to dynamically re-render directories.
* **Local Import Sandbox:** Drag and drop your local images, music tracks, or documents straight into the interface to temporarily persist files via browser state.

### 💻 Advanced Integrated Utilities
* **Terminal Emulator:** Command-line suite supporting live actions:
  * `neofetch` - Prints a gorgeous ASCII logo alongside simulated software versions.
  * `ls`, `cd [dir]`, `pwd`, `mkdir [name]` - Manipulate, create, and browse the sandbox filesystem.
  * `theme [mode]` - Change system themes straight from the command line.
  * `clear`, `help` - Essential shell commands.
* **Multi-Format Media Previews:** 
  * Custom dark-themed HTML5 Video Player with smooth play/pause toggles and timeline sliders.
  * TextEdit reader allowing live plain-text document manipulation.
  * Clean preview rendering layouts for `.pdf` documents and images.

---

## 🛠️ Technology Stack

* **Core Framework:** HTML5 / React / JavaScript
* **Styling Framework:** Tailwind CSS (Backdrop-blurs, glassmorphism filters, responsive grids)
* **Icons:** Lucide Icons / FontAwesome
* **Animations:** CSS Transitions / Framer Motion spring modules

---

## 🚀 Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Kumar-Saurabh-Tiwari/infinity-os.git
