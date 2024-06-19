import "./App.css";
import {
    Button,
    Card,
    Center,
    createTheme,
    Group,
    MantineProvider,
    Space,
    Stack,
    Text,
    TextInput,
} from "@mantine/core";
import { useAppStore } from "./Store";
import QRCode from "react-qr-code";

const theme = createTheme({});

function SenderButton() {
    const setRole = useAppStore((store) => store.setRole);
    const handleOnCLick = () => setRole("sender");

    return (
        <Button
            variant="default"
            onClick={handleOnCLick}
        >
            Sender
        </Button>
    );
}

function RecieverButton() {
    const setRole = useAppStore((store) => store.setRole);
    const handleOnCLick = () => setRole("receiver");

    return (
        <Button
            variant="default"
            onClick={handleOnCLick}
        >
            Reciever
        </Button>
    );
}

function ClearRoleButton() {
    const setRole = useAppStore((store) => store.setRole);
    const closeConnection = useAppStore((store) => store.closeConnection);
    const setReceiverId = useAppStore((store) => store.setReceiverId);
    const clearDataLog = useAppStore((store) => store.clearDataLog);

    const handleOnCLick = () => {
        setRole("");
        closeConnection();
        setReceiverId("");
        clearDataLog();
    };

    return (
        <Button
            variant="default"
            onClick={handleOnCLick}
        >
            X
        </Button>
    );
}

function CardHeader() {
    const role = useAppStore((store) => store.role);

    return (
        <Group justify="space-between">
            <Text>{role}</Text>
            <ClearRoleButton />
        </Group>
    );
}

function SenderCard() {
    const senderState = useAppStore((store) => store.senderState);
    const openConnection = useAppStore((store) => store.openConnection);
    const setReceiverId = useAppStore((store) => store.setReceiverId);
    const receiverId = useAppStore((store) => store.receiverId);

    const buttonText = () => {
	    switch(senderState) {
	case "disconnected": 
		    return "connect";
	case "waiting":
		    return "connecting...";
	    case "connected":
		    return "connected";
	    }}

	const buttonDisabled = () => {
	return receiverId === "" || ["waiting", "connected"].includes(senderState)
	}

    return (
        <>
            <TextInput
                placeholder="Sender ID..."
                value={receiverId}
                onChange={(e) => setReceiverId(e.currentTarget.value)}
            />
            <Space h="md" />
            
                <Button
                    disabled={buttonDisabled()}
                    onClick={openConnection}
                >
	    {buttonText()}
                </Button>
        </>
    );
}

function ReceiverCard() {
    const beginReceiving = useAppStore((store) => store.beginReceiving);
    const dataLog = useAppStore((store) => store.dataLog);
    const receiverState= useAppStore((store) => store.receiverState);
    const clientId = useAppStore((store) => store.clientId);	
    const stopReceiving = useAppStore((store) => store.stopReceiving);

    const buttonDisabled = () => {
	return ["waiting", "connected"].includes(receiverState)	
    }

    const buttonText = () => {
	    const text = {
	"disconnected": "Start Receiving",
	"waiting": "Initializing...",
	"connected": "Ready"
    }
	    return text[receiverState]
    }

    return (
        <>
	    {clientId && <Stack><Text>ID: {clientId}</Text>
            <QRCode value={clientId ?? "default-id"} /></Stack>}
            <Space h="md" />
            <Button disabled={buttonDisabled()} onClick={beginReceiving}>{buttonText()}</Button>
	    <Button disabled={receiverState === "disconnected"} onClick={stopReceiving}>X</Button>
            <Stack>
                {dataLog.map((each) => (
                    <Text key={each}>{each}</Text>
                ))}
            </Stack>
        </>
    );
}

function App() {
    const role = useAppStore((store) => store.role);

    const RoleInterface = () =>
        role === "sender" ? <SenderCard /> : <ReceiverCard />;

    return (
        <MantineProvider theme={theme}>
            <div className="App">
                {role === "" ? (
                    <Stack
                        h={"100%"}
                        justify="center"
                        align="center"
                    >
                        <SenderButton />
                        <RecieverButton />
                    </Stack>
                ) : (
                    <Center
                        h="100%"
                        w="100%"
                    >
                        <Card w="75%">
                            <CardHeader />
                            <Space h="md" />
                            <RoleInterface />
                        </Card>
                    </Center>
                )}
            </div>
        </MantineProvider>
    );
}

export default App;
