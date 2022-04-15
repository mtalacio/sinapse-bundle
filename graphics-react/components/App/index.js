import { Box, Typography, Paper } from '@mui/material';
import React, { useEffect, useState } from 'react';
import NCGStore, {replicate, listen} from '../../store/NodecgStore';
import ContestantCard from '../ContestantCard';
function App() {

    const [replicants, setReplicants] = useState({...NCGStore.getReplicants()});
    const [showAnswer, setShowAnswer] = useState(false);

    useEffect(() => {
        replicate("currentQuestion");
        replicate("users");
        replicate("timer");
        NCGStore.on("change", () => {
            setReplicants({...NCGStore.getReplicants()});
        })
    },[])

    useEffect(() => {
        listen("showAnswer");
        listen("hideAnswer");
        listen("select");
        listen("answer");
        NCGStore.on("message", (args) => {
            switch(args.subType) {
                case "showAnswer":
                    setShowAnswer(true);
                    break;
                case "hideAnswer":
                    setShowAnswer(false);
                    break;
                default:
                    console.log(`Ignored ${args.subType}`);
                    break;
            }
        })
        
    }, [])

    return(
        <>  
            <Box sx={{position: "fixed", width: "100%", top: "300px"}}>
                <Box sx={{display: "flex", justifyContent: "center"}}>
                    <Paper variant="outlined" sx={{padding: "10px", borderColor: "black"}}>
                        <Typography sx={{fontSize: "32px"}}>{replicants.currentQuestion && replicants.currentQuestion.question}</Typography>
                    </Paper>
                </Box>
                <Box sx={{display: "flex", justifyContent: "center", marginTop: "15px"}}>
                    {showAnswer && <Paper variant="outlined" sx={{padding: "10px", borderColor: "black", minWidth: "200px"}}>
                        <Typography sx={{fontSize: "18px"}}>Resposta:</Typography>
                        <Box sx={{display: "flex", justifyContent: "center"}}>
                            <Typography sx={{fontSize: "22px"}}>{showAnswer && replicants.currentQuestion.answer}</Typography>
                        </Box>
                    </Paper>}
                </Box>
            </Box>
            {replicants.users && 
                <Box sx={{display: "flex", justifyContent: "space-around", 
                    position: "fixed", width: "100%", bottom: "200px"}}>
                    <ContestantCard {...replicants.users[0]}/>
                    <ContestantCard {...replicants.users[1]}/>
                    <ContestantCard {...replicants.users[2]}/>
                    <ContestantCard {...replicants.users[3]}/>
                </Box>
            }
            {replicants.timer !== undefined && replicants.timer > 0 &&
                <Box sx={{position: "fixed", width: "100%", display: "flex", justifyContent: "center", bottom: "350px"}}>
                    <Typography sx={{fontSize: "42px"}}>{replicants.timer}</Typography>
                </Box>
            }
        </>
    )
}

export default App;