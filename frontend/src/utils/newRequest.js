import axios from "axios";

const newRequests = axios.create({
  baseURL: `http://localhost:5132/api/`, 
  withCredentials: true,
});

export default newRequests;
