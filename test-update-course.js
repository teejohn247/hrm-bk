// test-update-course.js
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

// Configuration
const API_URL = 'http://localhost:8080/api/v1';
const COURSE_ID = '67f6436cdef2e1e08b95d13f'; // Replace with your course ID

// Create formData
const formData = new FormData();
formData.append('title', 'Updated Course Title');
formData.append('description', '<p>This is an updated course description</p>');
formData.append('categoryId', '67ec1e76705fa50bb084705f');
formData.append('level', 'Advanced');
formData.append('courseManager', '66d196b44e94a9db4c54a381');
formData.append('videoUrl', 'https://res.cloudinary.com/teejohn247/video/upload/v1744186456/Mastering_Access_Control__Safeguarding_Greenpeg_s_Future_ndmtcp.mp4');
formData.append('duration', 120);
formData.append('courseDeadline', null);

// Optional: If you want to update the thumbnail, uncomment and modify this
// const thumbnailPath = './path/to/thumbnail.png';
// if (fs.existsSync(thumbnailPath)) {
//   formData.append('thumbnail', fs.createReadStream(thumbnailPath));
// }

// Function to update course
async function updateCourse() {
  try {
    console.log(`Updating course with ID: ${COURSE_ID}`);
    
    const config = {
      headers: {
        ...formData.getHeaders(),
      },
    };
    
    const response = await axios.patch(
      `${API_URL}/course/${COURSE_ID}`,
      formData,
      config
    );
    
    console.log('Update successful!');
    console.log(JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('Error updating course:');
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
    }
    throw error;
  }
}

// Run the update function
updateCourse()
  .then(() => console.log('Test completed'))
  .catch((err) => console.error('Test failed')); 