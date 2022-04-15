import { Typography, Box, Button, Paper, TextField } from '@mui/material';
import React, { useMemo } from 'react';
import { useState, useEffect } from "react";
import NCGStore, { sendMessage, setReplicant } from "../../store/NodecgStore"
import { replicate } from "../../store/NodecgStore"
import PersonCard from "../PersonCard"
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import { ArrowForward } from '@material-ui/icons';

function AppPage() {

    const [replicants, setReplicants] = useState(NCGStore.getReplicants()); 

    const [buzzerOrder, setBuzzerOrder] = useState([]);

    const [currentQuestionId, setCurrentQuestionId] = useState(0);

    const [questionFile, setQuestionFile] = useState("");

    const [questions, setQuestions] = useState([
        {id: 0, question: "Teste", answer: "Teste Answer"}
    ]);

    const [intervalRef, setIntervalRef] = useState(null);
    const [timer, setTimer] = useState(0);

    const columns = useMemo(() => [
        {field: 'question', headerName: "Question", width: 1000},
        {field: 'answer', headerName: "Answer", width: 400},
        {
            field: 'actions', headerName: "Actions", type: "actions", width: 80,
            getActions: (params) => [
                <GridActionsCellItem
                    icon={<ArrowForward/>}
                    label="Show"
                    onClick={() => showQuestion(params.id)}/>
            ]
        }
    ])

    const showQuestion = (id) => {
        resetBuzzerList();
        setCurrentQuestionId(id);
        sendMessage("select", -1);
        sendMessage("hideAnswer", undefined);
        setReplicant("currentQuestion", questions[id]);
        sendMessage("unlockAll")
        startTimer();
    }

    const loadQuestions = () => {
        setQuestions(replicants.questions);
    }

    const importQuestions = () => {
        let reader = new FileReader();

        reader.readAsText(questionFile);

        reader.onload = () => {
            let result = [];
            let lines = reader.result.split("\r\n");
            let headers = ["id", ...lines[0].split(',')];

            for(let i = 1; i < lines.length; i++) {

                let obj = {id: i - 1};
                let currentLine = lines[i].split(",");

                for(let j = 1; j < headers.length; j++) {
                    obj[headers[j]] = currentLine[j - 1];
                }

                result.push(obj);
            }

            console.log(result);
            setQuestions(result);
            setReplicant("questions", result);
        }
    }

    useEffect(() => {
        if(replicants.questions === undefined)
            return;
        setQuestions(replicants.questions);
    }, [replicants.questions])

    useEffect(() => {
        replicate("questions");
        replicate("users");
        replicate("buzzers");

        NCGStore.on("change", () => {
            setReplicants({...NCGStore.getReplicants()})
        })

    }, [])

    const nextQuestion = () => {
        resetBuzzerList();
        sendMessage("hideAnswer", undefined);
        sendMessage("select", -1);
        setCurrentQuestionId(currentQuestionId + 1);
        setReplicant("currentQuestion", questions[currentQuestionId + 1]);
        sendMessage("unlockAll")
        startTimer();
    }

    const resetBuzzerList = () => {
        setReplicant("buzzers", []);
    }

    const showAnswer = () => {
        sendMessage("showAnswer", undefined);
    }

    const startTimer = () => {
        var timeRe = 5;
        setTimer(timeRe);
        setReplicant("timer", timeRe);
        var intervalId = setInterval(() => {
            timeRe = timeRe - 1;
           
            if(timeRe <= 0) {
                clearInterval(intervalId);
                setTimer(0);
                sendMessage("timerUp");
            }
            
            setTimer(timeRe);
            setReplicant("timer", timeRe);
        }, 1000)
    }

    const convertTimer = () => {
        return `0${timer}.00`;
    }

    return(
        <>
            <Box sx={{display: "flex", flexDirection: "column"}}>
                <Box sx={{display: "flex"}}>
                    {replicants.users && <>
                        <PersonCard id={0} users={replicants.users}/>
                        <PersonCard id={1} users={replicants.users}/>
                        <PersonCard id={2} users={replicants.users}/>
                        <PersonCard id={3} users={replicants.users}/>
                    </>}
                    <Paper sx={{display: "flex", flexDirection: "column", width: "250px", padding: "15px", margin: "5px"}}>
                        <Box>
                            <Typography sx={{fontWeight: 700}}>Timer</Typography>
                            <Typography sx={{fontWeight: 700, fontSize: "22px"}}>{convertTimer()}</Typography>
                        </Box>
                        <Box sx={{marginTop: "25px"}}>
                            <Typography sx={{fontWeight: 700}}>Buzzer control</Typography>
                            <Box sx={{display: "flex", flexDirection: "column", marginTop: "5px"}}>
                                <Button variant="contained" sx={{marginBottom: "5px"}} onClick={() => sendMessage("unlockAll")}>Unlock all</Button>
                                <Button variant="contained" color="error" onClick={() => sendMessage("lockAll")}>Lock all</Button>
                            </Box>
                            <Typography sx={{fontWeight: 700, marginTop: "15px"}}>Buzzer order</Typography>
                            {replicants.buzzers && replicants.buzzers.map(item => (
                                <Typography key={item}>{item}</Typography>
                            ))}
                        </Box>
                    </Paper>
                    <Paper sx={{display: "flex", flexDirection: "column", width: "250px", padding: "15px", margin: "5px"}}>
                        <Typography sx={{fontWeight: 700}}>Flow Control</Typography>

                        <Typography sx={{marginTop: "25px"}}>Current Question:</Typography>
                        <Typography>{questions[currentQuestionId].question}</Typography>

                        <Typography sx={{marginTop: "10px"}}>Current Answer:</Typography>
                        <Typography>{questions[currentQuestionId].answer}</Typography>

                        <Box sx={{display: "flex", flexDirection: "column", marginTop: "25px"}}>
                            <Button variant="contained" sx={{marginBottom: "5px"}} onClick={() => nextQuestion()}>Next Question</Button>
                            <Button variant="contained" onClick={() => showAnswer()}>Show Answer</Button>
                        </Box>

                        <Box sx={{display: "flex", flexDirection: "column", marginTop: "25px"}}>
                            <Button variant="contained" sx={{marginBottom: "25px"}} onClick={() => loadQuestions()}>Load questions</Button>
                            <TextField type="file" onChange={(event) => setQuestionFile(event.target.files[0])}/>
                            <Button variant="contained" sx={{marginTop: "5px"}} onClick={() => importQuestions()}>Import questions</Button>
                        </Box>
                    </Paper>
                </Box>
                <Box>
                    <Paper sx={{padding: "15px", margin: "5px"}}>
                        <Typography sx={{fontWeight: 700}}>Questions</Typography>
                        <Box sx={{marginTop: "10px"}}>
                            <DataGrid autoHeight columns={columns} rows={questions}
                                pageSize={5}
                                disableColumnMenu
                                disableColumnSelector
                                disableSelectionOnClick/>
                        </Box>
                    </Paper>
                </Box>
            </Box>
        </>
    )
}

export default AppPage;