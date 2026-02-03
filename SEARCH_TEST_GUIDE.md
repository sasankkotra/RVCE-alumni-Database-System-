# Quick Test Guide for AI Search

## How to Test the Improved Search

### 1. Start the Backend Server
```bash
cd /Users/sasank.kotra/alumni_DBMS/backend
npm start
```

### 2. Access the Directory Page
Open: `http://localhost:3000/directory`

### 3. Test Queries

#### Test Semantic Understanding:
Try: **"I need help in building career in IC design field"**
- Should return alumni in: VLSI, Electronics, ECE, Hardware, Chip Design

Try: **"software development opportunities"**
- Should return: Software Engineers, Developers, Full Stack, Backend, Frontend

#### Test Spelling Mistakes:
Try: **"machne lerning career"** (typo: machne → machine)
- Should still return: ML Engineers, AI Engineers, Data Scientists

Try: **"elektronics and hardware"** (typo: elektronics → electronics)
- Should still return: ECE graduates, VLSI engineers, Hardware engineers

Try: **"full stak developper"** (typos: stak → stack, developper → developer)
- Should still return: Full Stack Developers, Web Developers

#### Test Domain Knowledge:
Try: **"chip design"**
- Should understand: VLSI, IC design, Semiconductor, Electronics

Try: **"construction work"**
- Should understand: Civil Engineering, Building, Structural

Try: **"AI and data"**
- Should understand: Machine Learning, Data Science, Analytics

### 4. Check the Badges
- **🤖 AI-Powered**: Appears when Google Gemini AI is used
- **✨ Smart Search**: Appears when local fuzzy matching is used

### 5. Expected Behavior
✅ Natural language queries work
✅ Spelling mistakes are tolerated
✅ Related fields are matched (IC design → VLSI)
✅ Results are ranked by relevance
✅ Fast response times

## Quick Test Checklist

- [ ] "IC design career" matches VLSI/Electronics
- [ ] "machne lerning" (typo) still works
- [ ] "software developper" (typo) still works
- [ ] "chip dezign" (typo) matches chip design
- [ ] "construction" matches Civil Engineering
- [ ] Natural language queries work
- [ ] Badge shows AI-Powered or Smart Search
- [ ] Results are ranked by relevance

## Troubleshooting

### If Search Returns No Results:
1. Make sure you have alumni data in the database
2. Check that alumni have `verified = TRUE`
3. Verify the backend server is running

### If AI Mode Not Working:
- Check if `GOOGLE_AI_API_KEY` is set in `.env`
- System will automatically fall back to Smart Search mode
- Both modes work well!

### To Restart Backend:
```bash
cd /Users/sasank.kotra/alumni_DBMS/backend
npm start
```

## What Changed?

### Backend (`routes/alumni.js`):
1. Enhanced AI prompt with better domain knowledge
2. Added fuzzy matching with Levenshtein distance
3. Added domain knowledge mappings (IC design → VLSI, etc.)
4. Added intelligent scoring system
5. Better fallback mechanisms

### Frontend (`views/directory.ejs`):
1. Shows AI-Powered or Smart Search badge
2. Better empty state with helpful suggestions
3. Cleaner result display

### New Features:
✨ Semantic understanding (IC design → VLSI)
✨ Typo tolerance (machne → machine)
✨ Domain knowledge mapping
✨ Intelligent result ranking
✨ Better user feedback
