# Audiora – Heritage Audio Guide 🏛️🎧
**"Discover Heritage Through Sound"**

Audiora is a responsive educational web application designed for students, educators, and cultural heritage enthusiasts. It brings historical facts, architectural information, examples, and learning materials together in an elegant, heritage-inspired digital guide.

---

## 🌟 Key Highlights & Requirements Checklist

| Requirement | Implementation Detail | Status |
| :--- | :--- | :---: |
| **Application Name & Subtitle** | "Audiora – Heritage Audio Guide" with subtitle "Discover Heritage Through Sound" | ✅ |
| **Heritage Design & Colors** | Warm cream (`#FAF7F2`), royal sandstone browns (`#2A170E`, `#432415`), and imperial gold (`#C59B27`) | ✅ |
| **Navigation Bar** | Sticky header with links: **Home**, **Explore Heritage**, **Audio Guides**, **Quiz**, and **About**, with mobile hamburger drawer | ✅ |
| **Key Indian Historical Places** | **Brihadeeswarar Temple**, **Taj Mahal**, **Mahabalipuram**, **Monuments of Hampi**, **Sun Temple Konark**, and **Qutub Minar** | ✅ |
| **Heritage Cards** | Image, place name, regional name, location, era/dynasty tags, short historical summary, audio controls, and "Read More" | ✅ |
| **Spoken Audio Guide** | Built using browser **JavaScript Web SpeechSynthesis API** with dedicated **Play** and **Stop** buttons | ✅ |
| **Speed & Voice Control** | Narration speed selection (`0.8x`, `1.0x`, `1.25x`) with animated sound visualizer waves | ✅ |
| **Dedicated Audio Guides Lounge** | Interactive master player, quick playlist, and read-along narration transcript box | ✅ |
| **Search & Filters** | Real-time search by place name, dynasty, or location + category filters (Temples, Monuments, Caves, etc.) | ✅ |
| **Read More Modal** | In-depth historical modal with commission records, materials, timeline, and bulleted architectural highlights | ✅ |
| **History Quiz** | Multi-question interactive quiz with score calculation, immediate answer explanations, progress bar, and final rank badge | ✅ |
| **About Section** | Educational rationale, accessibility goals, and academic project stats | ✅ |
| **Responsive Design** | Fluid layouts optimized for mobile phones, tablets, and desktop computers | ✅ |
| **Authentic History** | Factually accurate historical records (Chola, Pallava, Mughal, Ganga, and Vijayanagara dynasties) | ✅ |

---

## 📁 Project File Structure

```text
vanitha project/
├── index.html          # Semantic HTML5 master document & application structure
├── css/
│   └── styles.css      # Custom heritage-styled CSS (Cream, Brown, Gold palette, flex/grid, animations)
├── js/
│   ├── data.js         # Curated historical data records and interactive quiz dataset
│   └── app.js          # SpeechSynthesis audio engine, dynamic renderer, search, modal & quiz logic
└── README.md           # Project report, documentation, and local execution instructions
```

---

## 🚀 How to Run the Application Locally

Since Audiora is built using native **HTML5**, **CSS3**, and modern **vanilla JavaScript**, it does not require external build tools, NPM dependencies, or package managers.

### Method 1: Direct Browser Launch (Easiest)
1. Navigate to the project directory on your computer:
   `c:\Users\acer\OneDrive\Desktop\vanitha project`
2. Double-click **`index.html`** or right-click `index.html` → **Open with** → **Google Chrome**, **Microsoft Edge**, **Brave**, or **Mozilla Firefox**.
3. The application will immediately launch in your browser.

### Method 2: Using Python Simple HTTP Server
If you have Python installed, you can start a local development server:
```bash
# In PowerShell or Command Prompt inside the project folder:
python -m http.server 8000
```
Then open your browser and navigate to:
```
http://localhost:8000
```

### Method 3: Using VS Code Live Server
1. Open the project folder in Visual Studio Code.
2. Install the **Live Server** extension (by Ritwick Dey).
3. Click **"Go Live"** on the bottom status bar of VS Code.

---

## 🏛️ Featured Heritage Sites in Audiora

1. **Brihadeeswarar Temple (Thanjavur, Tamil Nadu)**
   - *Era:* Chola Dynasty (1010 CE)
   - *Builder:* Emperor Rajaraja Chola I
   - *Feats:* Consecrated entirely of interlocking granite dry-masonry with zero mortar; 66m soaring Vimana crowned by an 80-tonne monolithic granite dome.

2. **Taj Mahal (Agra, Uttar Pradesh)**
   - *Era:* Mughal Empire (1632–1653 CE)
   - *Builder:* Emperor Shah Jahan for Mumtaz Mahal
   - *Feats:* Pristine Makrana white marble, bilateral symmetry, 28 types of semi-precious Pietra Dura stone inlays, and outward-tilted minarets.

3. **Group of Monuments at Mahabalipuram (Mamallapuram, Tamil Nadu)**
   - *Era:* Pallava Dynasty (7th–8th Century CE)
   - *Builder:* King Narasimhavarman I (Mamalla) & Rajasimha
   - *Feats:* Open-air rock-cut bas-relief *Descent of the Ganges (Arjuna's Penance)*, monolithic *Pancha Rathas*, and the 1,300-year-old coastal *Shore Temple*.

4. **Monuments of Hampi (Vijayanagara, Karnataka)**
   - *Era:* Vijayanagara Empire (14th–16th Century CE)
   - *Builder:* Harihara I, Bukka Raya & Emperor Krishnadevaraya
   - *Feats:* Famous monolithic Stone Chariot (featured on ₹50 note) and 56 musical acoustic granite pillars at Vijaya Vittala Temple.

5. **Sun Temple, Konark (Puri, Odisha)**
   - *Era:* Eastern Ganga Dynasty (1250 CE)
   - *Builder:* King Narasimhadeva I
   - *Feats:* Conceived as a colossal stone chariot for the Sun God Surya with 24 giant stone wheels that function as accurate solar sundials.

6. **Qutub Minar & Complex (Mehrauli, New Delhi)**
   - *Era:* Delhi Sultanate & Gupta Empire (1199 CE)
   - *Builder:* Qutb-ud-din Aibak & Shams-ud-din Iltutmish
   - *Feats:* World's tallest brick minaret (72.5m) and the 1,600-year-old rust-resistant Gupta Iron Pillar.

---

## 🔊 Browser Audio Guide Features (SpeechSynthesis API)

- **Zero Heavy Audio Downloads:** Uses the browser's built-in `window.speechSynthesis` API for instantaneous narration without buffering delays.
- **Card Controls:** Individual **Play** (`fa-play`) and **Stop** (`fa-stop`) buttons on each heritage card.
- **Playback Synchronization:** Real-time visual feedback:
  - Currently playing card gets a distinct gold border and animated soundwave pulses.
  - Floating global player bar appears automatically when audio is active.
  - Dedicated **Audio Guides Showcase Lounge** syncs with the currently playing monument and displays read-along text.
- **Speech Speed Control:** Visitors can switch speech speed seamlessly between `0.8x`, `1.0x` (normal), and `1.25x`.
- **Automatic Fallback:** Safe event handling ensures previous narrations cancel cleanly when a new monument is selected or when the page is unloaded.

---

## 🧠 Interactive History Quiz

- Multi-choice historical questions testing dynasty dates, architectural techniques, and cultural milestones.
- **Immediate Pedagogical Feedback:**
  - Highlights correct answers in green with checkmark.
  - Highlights incorrect picks in red and reveals the correct answer.
  - Displays a detailed historical fact explanation card for enriched learning.
- Dynamic score tracking with percentage and customized performance title (*"Heritage Master"*, *"History Scholar"*, *"Curious Explorer"*).
- Instant restart option to retake the quiz.

---

## 🎨 Design & Accessibility Principles

- **Heritage Theme:** Designed with a palette inspired by Indian stone temples, sandstone forts, and royal palaces (warm cream backgrounds, rich earthy browns, and golden trims).
- **Responsive Fluid Layout:** Uses modern CSS Grid and Flexbox with responsive breakpoints (`clamp()`, `@media (max-width: 992px)`, `@media (max-width: 768px)`).
- **Accessibility:** Semantic HTML elements (`<header>`, `<main>`, `<section>`, `<article>`, `<footer>`, `<dialog>`), descriptive ARIA labels, focus states, and keyboard navigation (including `Escape` key support for modals).

---

## 🎓 College Project Suitability

This project has been built to showcase clean, modular, and maintainable frontend software engineering:
- Clear separation of concerns (**HTML for semantics**, **CSS for design systems**, **data.js for historical content**, **app.js for logic & Web API integration**).
- Production-ready error handling (e.g. image fallback mechanisms, browser speech detection).
- Complete code comments and docstrings.

