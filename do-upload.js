const fs = require('fs');

async function test() {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNmE5YzhhY2YwYmE3YThkZTA0OTMzODJiIn0sImlhdCI6MTc4ODY4OTAxNywiZXhwIjoxNzg5MDQ5MDE3fQ.KkPTPQhedHC3NVg_Oek4ldQlLq-7f8qhSbzpxIskobQ';
  const chapterId = '6a9c8ae20ba7a8de0493382d';
  const filePath = 'backend/uploads/1788688148619.pdf';
  
  const buffer = fs.readFileSync(filePath);
  const blob = new Blob([buffer], { type: 'application/pdf' });
  const formData = new FormData();
  formData.append('pdf', blob, 'test.pdf');

  try {
    const res = await fetch(`http://localhost:5000/api/pdf/upload/${chapterId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Response:', text);
  } catch(e) {
    console.error('Fetch error:', e);
  }
}
test();
