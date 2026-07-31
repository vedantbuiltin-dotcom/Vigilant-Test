import { Button } from "@mui/material";
import { useState } from "react";
import TextField from "@mui/material/TextField";
import { Box } from "@mui/system";
import axios from "axios";

const Login = ({ login, token, handleAuth, logOut }) => {
  const [loginCreds, setLoginCreds] = useState({
    user: "",
    password: "",
  });

  const handleChange = (e) => {
    setLoginCreds({
      ...loginCreds,
      [e.currentTarget.id]: e.currentTarget.value,
    });
  };

  const handleBypassLogin = () => {
    // Bypass login - set mock user and token
    const mockUser = {
      user: "test@example.com",
      name: "Test User",
      department: "IT",
      set: "A",
      token: "bypass-token-" + Date.now(),
    };

    localStorage.setItem("token", mockUser.token);
    localStorage.setItem("user", mockUser.user);
    localStorage.setItem("department", mockUser.department);
    localStorage.setItem("applicantName", mockUser.name);
    localStorage.setItem("set", mockUser.set);
    localStorage.setItem("timeRemaining", 3600); // 1 hour in seconds
    localStorage.setItem("totalTime", 3600);

    handleAuth({
      user: mockUser.user,
      token: mockUser.token,
      applicantName: mockUser.name,
    });
  };

  const handleSubmit = async () => {
    const userIn = loginCreds.user;
    const passIn = loginCreds.password;
    const res = await axios({
      method: "post",
      url: process.env.REACT_APP_AUTH_ROUTE + "/login",
      data: {
        user: {
          user: userIn,
          password: passIn,
        },
      },
    });

    if (res.status !== 200) {
      logOut();
      return;
    }

    console.log(res.data);
    const data = res.data;

    // const timeRemainingStored = localStorage.getItem("timeRemaining");

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", data.user);
    localStorage.setItem("department", data.department);
    localStorage.setItem("applicantName", data.name);
    localStorage.setItem("set", data.set);

    // if (!timeRemainingStored || timeRemainingStored <= 0) {
    //   localStorage.setItem("timeRemaining", data.totaltime * 60);
    // }
    const timeRemainingDb = await getTimeRemFromDb();
    localStorage.setItem("timeRemaining", timeRemainingDb);

    localStorage.setItem("totalTime", data.totaltime);

    handleAuth({
      user: data.user,
      token: data.token,
      applicantName: data.name,
    });
    console.log(process.env.REACT_APP_AUTH_ROUTE + "/login");
  };

  const getTimeRemFromDb = async () => {
    const token = localStorage.getItem("token");

    // const topic = "Java";
    const urlQ = process.env.REACT_APP_GET_ROUTE + "/timeleft";

    try {
      const res = await axios({
        method: "GET",
        url: urlQ,
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          "Access-Control-Allow-Origin": "*",
          "x-access-token": "Bearer " + token,
        },
      });

      return res.data.timeleft;
      // setAnswers(res.data);
    } catch (error) {
      console.log(error);
      logOut();
    }
  };
  return (
    <div>
      <Box
        sx={{
          px: 4,
          py: 18,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          backgroundColor: "#DFF6E2",
          minHeight: "100vh",
        }}
      >
        <Box
          sx={{
            my: 2,
          }}
        >
          <TextField
            label="User Id"
            id="user"
            onChange={handleChange}
            type="text"
          />
        </Box>
        <Box
          sx={{
            my: 2,
          }}
        >
          <TextField
            label="Password"
            id="password"
            onChange={handleChange}
            type="password"
          />
        </Box>
        <Box
          sx={{
            my: 2,
          }}
        >
          <Button
            size="large"
            color="success"
            variant="contained"
            onClick={handleSubmit}
            sx={{ mr: 1 }}
          >
            Log in
          </Button>
          <Button
            size="large"
            color="info"
            variant="outlined"
            onClick={handleBypassLogin}
          >
            Demo / Bypass Login
          </Button>
        </Box>
      </Box>
    </div>
  );
};

export default Login;
