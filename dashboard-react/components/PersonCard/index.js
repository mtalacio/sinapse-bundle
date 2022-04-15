import React, { useEffect, useState } from "react";
import {Paper, TextField, Typography, Button, Box} from "@mui/material";
import { Lock, LockOpen } from "@material-ui/icons";
import { sendMessage, setReplicant } from "../../store/NodecgStore";

function PersonCard(props) {

    const [buzzerLocked, setBuzzerLocked] = useState(false);

    const thisUser = props.users[props.id];

    const [points, setPoints] = useState(thisUser.points);

    const [formData, setFormData] = useState({
        user: thisUser.name,
        pass: thisUser.pass,
        mathPoints: "",
        setPoints: ""
    })

    useEffect(() => {
        var userCopy = props.users;
        userCopy[props.id].points = points;
        setReplicant("users", userCopy);
    }, [points])

    useEffect(() => {
        setBuzzerLocked(props.users[props.id].locked);
    }, [props.users[props.id]])

    const onFormChange = event => {
        setFormData({...formData, [event.target.name]: event.target.value});
    }

    const toggleBuzzerLock = () => {
        setBuzzerLocked(!buzzerLocked);
    }

    const incrementPoints = (value) => {
        setPoints(points + value);
    }

    const updateUser = () => {
        var userCopy = props.users;
        userCopy[props.id].name = formData.user;
        userCopy[props.id].pass = formData.pass;
        setReplicant("users", userCopy);
    }

    const select = () => {
        sendMessage("select", props.id)
    }

    const setCorrect = (correct) => {
        sendMessage("answer", {id: props.id, correct: correct});
    }

    return(
        <Paper sx={{display: "flex", flexDirection: "column", width: "250px", padding: "15px", margin: "5px"}}>
            <Box sx={{display: "flex", flexDirection: "column"}}>
                <TextField 
                    value={formData.user}
                    name="user"
                    onChange={onFormChange}
                    label="User"/>
                <TextField
                    value={formData.pass}
                    name="pass"
                    onChange={onFormChange}
                    sx={{marginTop: "15px", marginBottom: "15px"}}
                    label="Password"/>
                <Button variant="contained" onClick={() => updateUser()}>Update</Button>
            </Box>
            <Box sx={{display: "flex", flexDirection: "column", marginTop: "20px"}}>
                <Box sx={{display: "flex"}}>
                    {buzzerLocked ? <Lock/> : <LockOpen/>} <Typography>Buzzer {buzzerLocked ? "Locked" : "Unlocked"}</Typography> 
                </Box>
                <Button variant="contained" color="error" sx={{marginTop: "5px"}}
                    onClick={() => toggleBuzzerLock()}>{buzzerLocked ? "Unlock" : "Lock"} Buzzer</Button>
            </Box>
            <Box sx={{display: "flex", flexDirection: "column", marginTop: "20px"}}>
                <Typography sx={{fontWeight: 700}}>Points: {points}</Typography>
                <Box sx={{display: "flex", justifyContent: "space-around"}}>
                    <Button variant="contained" onClick={() => incrementPoints(5)}>+5</Button>
                    <Button variant="contained" onClick={() => incrementPoints(10)}>+10</Button>
                    <Button variant="contained" onClick={() => incrementPoints(15)}>+15</Button>
                </Box>
                <Box sx={{display: "flex", justifyContent: "space-around", marginTop: "5px"}}>
                    <Button variant="contained" color="error" onClick={() => incrementPoints(-5)}>-5</Button>
                    <Button variant="contained" color="error" onClick={() => incrementPoints(-10)}>-10</Button>
                    <Button variant="contained" color="error" onClick={() => incrementPoints(-15)}>-15</Button>
                </Box>
                <Box sx={{marginTop: "15px", display: "flex"}}>
                    <TextField label="Math Points"
                        value={formData.mathPoints}
                        name="mathPoints"
                        onChange={onFormChange}/>
                    <Button variant="contained" sx={{marginLeft: "5px"}} 
                        onClick={() => incrementPoints(Math.abs(parseInt(formData.mathPoints)))}>+</Button>
                    <Button variant="contained" color="error" sx={{marginLeft: "5px"}}
                        onClick={() => incrementPoints(-Math.abs(parseInt(formData.mathPoints)))}>-</Button>
                </Box>
                <Box sx={{marginTop: "15px", display: "flex"}}>
                    <TextField label="Set Points"
                        value={formData.setPoints}
                        name="setPoints"
                        onChange={onFormChange}/>
                    <Button variant="contained" sx={{marginLeft: "5px"}} 
                        onClick={() => setPoints(parseInt(formData.setPoints))}>Set</Button>
                </Box>
                <Box sx={{marginTop: "15px", display: "flex", justifyContent: "space-between"}}>
                    <Button variant="contained" color="success" onClick={() => setCorrect(true)}>Correct</Button>
                    <Button variant="contained" color="error" onClick={() => setCorrect(false)}>Incorrect</Button>
                </Box>
                <Box sx={{marginTop: "15px", display: "flex", justifyContent: "space-between"}}>
                    <Button variant="contained" onClick={() => select()}>Select</Button>
                </Box>
            </Box>
        </Paper>
    )
}

export default PersonCard;