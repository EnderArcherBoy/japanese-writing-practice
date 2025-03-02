# Japanese Writing Practice

A web-based tool for practicing Japanese writing. This project is designed to help learners practice Hiragana, Katakana, and Kanji with stroke order guidance and recognition. It supports both Practice Mode (with stroke order instructions) and Testing Mode (with a blank canvas) to cater to different learning styles.

## Features

- **Practice Mode**: Guides you through the correct stroke order for Hiragana, Katakana, and Kanji characters.
- **Testing Mode**: Provides a blank canvas where you can practice writing characters from memory.
- **Simple and Minimalist UI**: No distractions, just the tools you need to practice.
- **Character Set**: Choose between Hiragana, Katakana, and Kanji, with characters sorted by JLPT level.
- **Stroke Order Tutorial**: Learn the correct stroke order for each character in Practice Mode.
- **Compatibility**: Works with mouse, touchscreen, or drawing tablet for input.
  
## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/EnderArcherBoy/japanese-writing-practice.git
    ```
   
2. Install dependencies:
    ```bash
    cd japanese-writing-practice
    npm install
    ```
   
3. Run the development server:
    ```bash
    npm run dev
    ```

4. Open your browser and go to `http://localhost:3000` to start practicing!

## Usage

- On the homepage, you can select a character set (Hiragana, Katakana, Kanji).
- Click on any character to open the practice canvas where you can either practice with stroke order guidance or test your memory in Testing Mode.

### Keyboard Shortcuts

- **Undo**: `Ctrl + Z`
- **Redo**: `Ctrl + Y`
- **Clear Canvas**: Button or `Ctrl + Shift + X`

## Technologies Used

- Next.js
- WanaKana for Hiragana and Katakana support
- `kanji.json` from the kanji-data repository https://github.com/davidluzgouveia/kanji-data for Kanji characters
- `kanjiVG` from the kanjiVG repository https://github.com/KanjiVG/kanjivg for all Japanese character graphic vector
- Tailwind CSS (for styling)

## Contributing

Feel free to fork this repo and make contributions! If you encounter any bugs or have suggestions for improvement, open an issue or submit a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
