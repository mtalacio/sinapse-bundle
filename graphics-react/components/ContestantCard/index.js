import { Check, Clear, ExitToApp, Mic } from "@material-ui/icons";
import { Paper, Typography, Box } from "@mui/material";
import { useEffect, useState } from "react";
import NCGStore, {listen} from "../../store/NodecgStore";

const defaultStyle = {
    width: "300px",
    padding: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
}

const wrongSx = {
    borderWidth: "2px",
    borderColor: "red"
}

const selectedSx = {
    borderWidth: "2px",
    borderColor: "blue"
}

const rightSx = {
    borderWidth: "2px",
    borderColor: "green"
}

function ContestantCard(props) {

    const [outlineState, setOutlineState] = useState(0);
    const [currentStyle, setCurrentStyle] = useState(defaultStyle);

    useEffect(() => {
        setOutlineState(0);
    }, [])

    useEffect(() => {
        NCGStore.on("message", (args) => {
            switch(args.subType) {
                case "select":
                    setOutlineState(args.data == props.id ? 1 : 0)
                    break;
                case "answer":
                    if(args.data.id !== props.id) {
                        setOutlineState(0);
                        return;
                    }

                    setOutlineState(args.data.correct ? 2 : 3);
                    break;
                default:
                    console.log(`Ignored ${args.subType}`);
                    break;
            }
        })
    }, [])

    useEffect(() => {
        console.log("run")
        switch(outlineState) {
            case 0:
                setCurrentStyle(defaultStyle);
                break;
            case 1:
                setCurrentStyle({...defaultStyle, ...selectedSx});
                break;
            case 2:
                setCurrentStyle({...defaultStyle, ...rightSx});
                break;
            case 3:
                setCurrentStyle({...defaultStyle, ...wrongSx});
                break;
        }
    }, [outlineState])

    const getIcon = () => {
        switch(outlineState) {
            case 0:
                return null;
            case 1:
                return <Mic fontSize="large"/>;
            case 2:
                return <Check fontSize="large"/>;
            case 3:
                return <Clear fontSize="large"/>;
        }
    }

    return(
        <Box>  
            <Paper 
                variant="outlined" sx={currentStyle}>
                <Box sx={{display: "flex", alignItems: "center"}}>
                    <Typography sx={{fontSize: "30px", fontWeight: 600, marginLeft: "10px", marginRight: "5px"}}>{props.name}</Typography>
                    {getIcon()}
                </Box>
                <Typography sx={{fontSize: "28px", fontWeight: 500, marginRight: "10px"}}>{props.points}</Typography>
            </Paper>
        </Box>
    )

}

export default ContestantCard;