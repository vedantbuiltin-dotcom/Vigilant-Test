const PDFDocument = require('pdfkit');
const fs = require('fs');

const doc = new PDFDocument();
doc.pipe(fs.createWriteStream('sample_questions.pdf'));

doc.fontSize(16).text('10 Essential React Questions', { underline: true });
doc.moveDown();

doc.fontSize(12).text('1. What is the Virtual DOM and how does it work?');
doc.moveDown();

doc.text('2. What is the difference between State and Props?');
doc.moveDown();

doc.text('3. Explain the useEffect hook and how its dependency array works.');
doc.moveDown();

doc.text('4. How does React handle routing?');
doc.moveDown();

doc.text('5. What are React hooks and why were they introduced?');
doc.moveDown();

doc.text('6. What is JSX?');
doc.moveDown();

doc.text('7. Explain the concept of lifting state up.');
doc.moveDown();

doc.text('8. What is the Context API and when would you use it?');
doc.moveDown();

doc.text('9. Explain how Higher-Order Components (HOCs) work.');
doc.moveDown();

doc.text('10. What is Redux and how does it relate to React?');

doc.end();

console.log('sample_questions.pdf created successfully');
