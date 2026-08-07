export function parseTextToStudents(text) {
  const students = [];
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  
  for (const line of lines) {
    // Look for an email address
    const emailMatch = line.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/i);
    if (emailMatch) {
      const email = emailMatch[1];
      const parts = line.split(email);
      
      let preEmail = parts[0].trim();
      let postEmail = (parts[1] || '').trim();
      
      // Clean up preEmail (remove leading numbers/IDs from the table column)
      preEmail = preEmail.replace(/^[\d\.\)]+\s*/, '').trim();
      
      const fullName = preEmail || 'Unknown Name';
      
      const postEmailWords = postEmail.split(/\s+/).filter(Boolean);
      let password = '';
      let batchName = 'Unassigned';
      if (postEmailWords.length > 1) {
        password = postEmailWords.shift();
        batchName = postEmailWords.join(' ');
      } else if (postEmailWords.length === 1) {
        password = postEmailWords[0];
      }
      
      students.push({
        fullName,
        email,
        batchName,
        password
      });
    }
  }
  return students;
}
