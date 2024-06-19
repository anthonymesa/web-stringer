import "./App.css";
import {
	FiCopy
} from "react-icons/fi";
import {
    Button,
    Textarea,
	CopyButton,
    Paper,
    Tabs,
    ScrollArea,
    Card,
    Divider,
    Title,
    Container,
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

function SenderCard() {
    const senderState = useAppStore((store) => store.senderState);
	const sendToReceiver = useAppStore((store) => store.sendToReceiver);
    const openConnection = useAppStore((store) => store.openConnection);
    const setReceiverId = useAppStore((store) => store.setReceiverId);
	const content = useAppStore((store) => store.content);
	const setContent = useAppStore((store) => store.setContent);
    const receiverId = useAppStore((store) => store.receiverId);
    const closeSenderConnection = useAppStore((store) => store.closeSenderConnection);
    const buttonText = () => {
	const text = {
	    "disconnected": "connect",
	    "waiting": "connecting...",
	    "connected": "connected",
	}
	return text[senderState];
    }

    const buttonDisabled = () => {
	return receiverId === "" || ["waiting", "connected"].includes(senderState)
    }
	const handleOnSubmit = () => {
		sendToReceiver(content);
	}

    return (
        <Stack styles={{root: {height: "100%", paddingTop: '1rem'}}}>
	    <Group justify="space-between">
		   <Group> 
			<Button disabled={buttonDisabled()} onClick={openConnection}>
				{buttonText()}
			</Button>

			{senderState !== "disconnected" 
				&& <Button onClick={() => closeSenderConnection()}>Stop</Button>
			}
		   </Group>
		    <TextInput
			placeholder="Receiver ID..."
			value={receiverId}
			onChange={(e) => setReceiverId(e.currentTarget.value)}
			style={{flex: 1}}
		    />
	   </Group>
	   <Textarea value={content} onChange={(e) => setContent(e.currentTarget.value)} h={"18rem"} styles={{wrapper: {height: '100%'}, input: {height: '100%'}}}/>
	    <Center>
	    <Button w={"6rem"} disabled={["disconnected", "waiting"].includes(senderState)} onClick={handleOnSubmit}>Send</Button>
	    </Center>
        </Stack>
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
	
    const ClientInfo = () => (
	<Group>
	    	<QRCode size={'4rem'} value={clientId} />
		<Title order={2}>ID:</Title>
	    	<Text>{clientId}</Text>
	</Group>
    );

    const InfoPlaceholder = () => (
	<Group>
	    	<Container h={'4rem'} w={'4rem'} bg={'#DDDDDD'} />
		<Title order={2}>ID:</Title>
	    	<Text>{clientId}</Text>
	</Group>
    )

    return (
        <>
	    <Space h="md" />
	    <Group justify="space-between">
	    	{receiverState === 'connected' 
		    ? <ClientInfo /> 
		    : <InfoPlaceholder />
	    	}
	    	
	    	<Group>            
	    		<Button 
	    	    		disabled={buttonDisabled()} 
	       	    		onClick={beginReceiving}>{buttonText()}</Button>
	    
	    		{receiverState !== "disconnected" 
		    		&& <Button onClick={stopReceiving}>Stop</Button>
			}
	    	</Group>
	    </Group>
	    <Space h="md"/>
	    <Paper withBorder shadow="0">
	    <ScrollArea h={'19rem'} type="always">
	    <Space h="md"/>
	    <Stack styles={{root: {paddingLeft: '1rem', paddingRight: '1rem'}}}>
                {dataLog.map((each) => (
			<Group>
                    <Text style={{flex: 1}} key={each}>{each}</Text>
			<CopyButton value={each.split('-').pop()}>
				{({copied, copy}) => ( 
					<Button onClick={copy} size={"xs"} variant="light"><FiCopy /></Button>
				)}	
			</CopyButton>
			</Group>
                ))}
            </Stack>
	    </ScrollArea>
	    </Paper>
        </>
    );
}

function App() {
    const role = useAppStore((store) => store.role);
    const setRole = useAppStore((store) => store.setRole);
    const closeConnection = useAppStore((store) => store.closeConnection);
    const setReceiverId = useAppStore((store) => store.setReceiverId);
    const clearDataLog = useAppStore((store) => store.clearDataLog);

    const handleOnChange = (tab) => {
	if (tab === role) return;
        setRole(tab);
        closeConnection();
        setReceiverId("");
        clearDataLog();
    };

    return (
        <MantineProvider theme={theme}>
            <div className="App">
		    <Center h="100%">
			    <Card w="80%" h="30rem" shadow="sm" padding="lg" radius="md">
				    <Tabs styles={{root: {flex: 1}}} value={role} onChange={handleOnChange}>
					<Tabs.List>
						<Tabs.Tab value="about">About</Tabs.Tab>
						<Tabs.Tab value="receiver">Receiver</Tabs.Tab>
						<Tabs.Tab value="sender">Sender</Tabs.Tab>
					</Tabs.List>
					
					<Tabs.Panel value="about">
						<Space h="md" />
						<Title>Web-Stringer</Title>	
	    					<Divider my="md" />
	    					<Text>This application uses PeerJS and WebRTC technology to provide an easy way of sending data across clients without a backend (essentially). This application is hosted on github, and uses a freely available PeerJS and TURN server, allowing this application to provide remote connection without requiring beckend development from the developer.</Text>
<Space h="md"/>
	    <Text>Developed by Anthony Mesa, admesa@protonmail.com, anthonymesa@github.com</Text>
					</Tabs.Panel>
					
					<Tabs.Panel value="receiver">
						<ReceiverCard />
					</Tabs.Panel>

					<Tabs.Panel value="sender">
						<SenderCard />
					</Tabs.Panel>
				    </Tabs>
			    </Card>
		    </Center>
	    </div>
        </MantineProvider>
    );
}

export default App;
