
# Setup Guide: Google Sheets as a Database for Kerala PSC Guru

Follow these steps to configure your application correctly using Google Sheets as your backend.

## Part 1: Google Sheets Tabs & Columns

Create the following tabs in your Google Sheet and add the headers in the first row (A1, B1, C1...).

### 1. `Exams` Tab
This stores the main list of examinations.
- **A: `id`** - Unique ID for the exam (e.g., `ldc_exam`).
- **B: `title_ml`** - Malayalam Title.
- **C: `title_en`** - English Title.
- **D: `description_ml`** - Malayalam Description.
- **E: `description_en`** - English Description.
- **F: `category`** - `General`, `Technical`, or `Special`.
- **G: `level`** - `Preliminary`, `Main`, `Departmental`, or `Special`.
- **H: `icon_type`** - Choose from: `book`, `shield`, `cap`, `beaker`, `light`, `star`, `globe`.

### 2. `Syllabus` Tab
This defines the practice modules/topics inside each exam.
- **A: `id`** - Unique ID for the topic (e.g., `ldc_maths_1`).
- **B: `exam_id`** - Must match the `id` from the **Exams** tab.
- **C: `title`** - Display name of the test (e.g., `Mental Ability`).
- **D: `questions`** - Number of questions (e.g., `20`).
- **E: `duration`** - Duration in minutes (e.g., `15`).
- **F: `topic`** - String to filter questions from **QuestionBank** (e.g., `Topic:Mental Ability`).

### 3. `QuestionBank` Tab
The pool of all questions.
- **A: `id`** - Unique ID.
- **B: `topic`** - Match this with the `topic` column in the **Syllabus** tab.
- **C: `question`** - The question text.
- **D: `options`** - JSON array of 4 options (e.g., `["A", "B", "C", "D"]`).
- **E: `correctAnswerIndex`** - 0, 1, 2, or 3.
- **F: `subject`** - `GK`, `Maths`, `English`, `Malayalam`, `Science`, or `Technical`.
- **G: `difficulty`** - `Easy`, `Moderate`, or `PSC Level`.

... (Other tabs like Notifications, Bookstore etc. follow their existing structures)
