import "./App.css";
import {
	useState,
	useRef,
	useEffect,
} from 'react'
import {
	FiUploadCloud,
	FiPlayCircle,
	FiStopCircle,
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

const theme = createTheme({});

function SenderCard() {
	const senderState = useAppStore((store) => store.senderState);
	const sendToReceiver = useAppStore((store) => store.sendToReceiver);
	const openConnection = useAppStore((store) => store.openConnection);
	const setReceiverId = useAppStore((store) => store.setReceiverId);
	const content = useAppStore((store) => store.content);
	const setContent = useAppStore((store) => store.setContent);
	const receiverId = useAppStore((store) => store.receiverId);
	const closeSenderConnection = useAppStore((store) => 
		store.closeSenderConnection
	);

	const statusText = () => {
		const text = {
				"disconnected": <span style={{color: 'red'}}>Disconnected</span>,
				"waiting": <span style={{color: 'blue'}}>Trying to connect...</span>,
				"connected": <span style={{color: 'green'}}>Connected</span>,
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
		<Stack justify="flex-start" gap="xs" styles={{root: {height: "100%", paddingTop: '1rem'}}}>
			<Center>
				<Text size="xs">
					Status: {statusText()}
				</Text>
			</Center>
		<TextInput
				placeholder="Receiver ID..."
				value={receiverId}
				onChange={(e) => setReceiverId(e.currentTarget.value)}
			/>
			<Group justify="space-between">
				<Group> 
										{senderState !== "disconnected" 
						? <Button variant="light" color="red" onClick={() => closeSenderConnection()}><FiStopCircle /></Button> 
						: <Button variant="light" color="green" disabled={buttonDisabled()} onClick={openConnection}>
					  <FiPlayCircle />
					</Button>
					}
				</Group>
				<Button 
					color="blue"
					variant="light"
					disabled={["disconnected", "waiting"].includes(senderState)} 
					onClick={handleOnSubmit}
				>
					<FiUploadCloud />
				</Button>

		  </Group>
			
			<Textarea 
				value={content}
				style={{flex: 1}}
				placeholder={'Data to send...'}
				onChange={(e) => setContent(e.currentTarget.value)} 
				styles={{wrapper: {height: '100%'}, input: {whiteSpace: 'pre-wrap', height: '100%'}}}
			/>
		</Stack>
	);
}

function ReceiverCard() {
    const beginReceiving = useAppStore((store) => store.beginReceiving);
    const dataLog = useAppStore((store) => store.dataLog);
    const receiverState= useAppStore((store) => store.receiverState);
    const getRawClientId = useAppStore((store) => store.getRawClientId);	
    const stopReceiving = useAppStore((store) => store.stopReceiving);

		const paperRef = useRef(null);
		const [scrollHeight, setScrollHeight] = useState(0);

		useEffect(() => {
			const reference = paperRef.current;

			const updateHeight = () => {
				if (reference) {
					setScrollHeight(reference.clientHeight);
				}
			}

			const observer = new ResizeObserver((entries) => {
				for(let entry of entries) {
					setScrollHeight(entry.contentRect.height);
				}
			});
			
			if (reference) {
				observer.observe(reference);
			}

			window.addEventListener('resize', updateHeight);

			return () => {
				if (reference) {
					observer.unobserve(reference);
				}
				window.removeEventListener('resize', updateHeight);
			}
		}, []);

    const statusText = () => {
			const text = {
				"disconnected": (<span style={{color: "red"}}>Offline</span>),
				"waiting": <span style={{color: "blue"}}>Initializing...</span>,
				"connected": <span style={{color: "green"}}>Ready</span>
			}

	    return text[receiverState]
    }

    return (
			<Stack gap="xs" justify="flex-start" styles={{root: {height: "100%", paddingTop: '1rem'}}}>
				<Center>
					<Text size="xs">Status: {statusText()}</Text>
				</Center>
				<Group gap="xs">
				  {receiverState !== "disconnected" 
						? <Button size="xs" variant="light" color="red" onClick={stopReceiving}><FiStopCircle /></Button>
						: <Button
								variant="light"
								color="green"
								size="xs"
								onClick={beginReceiving}
							>
								<FiPlayCircle/>
							</Button>
					}
					<Title order={4}>ID:</Title>
					<Text size="xs">{getRawClientId()}</Text>

				</Group>
				<Paper withBorder shadow="0" style={{flex: 1}} ref={paperRef}>
					<ScrollArea h={scrollHeight} type="auto" styles={{root: {overflow: 'auto', maxWidth: '100%'}}} scrollbarSize={3}>
						<Stack 
							gap="xs"
							styles={{root: {paddingLeft: '1rem', paddingRight: '1rem', minWidth: '400px'}}}
						>
							<Space h="xs" />
							{dataLog.map((each) => (
							<>
									<Divider labelPosition="left" label={each.meta} size="xs" /> 
									<CopyButton value={each.value}>
										{({copied, copy}) => ( 
												<Text style={{whiteSpace: 'pre-wrap', cursor: 'pointer'}} onClick={copy} size="xs">
													{each.value}
												</Text> 
										)}	
									</CopyButton>
									</>
							))}
						</Stack>
					</ScrollArea>
				</Paper>
			</Stack>
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
						<Card h="95%" w="95%" shadow="sm" padding="xs" radius="md">
							<Tabs 
								styles={{root: {flex: 1}, 
									panel: {height: 'calc(100% - 2.5rem)'},
									tab: {width: '2rem'}}} 
								value={role} 
								onChange={handleOnChange}
							>
								<Tabs.List grow>
									<Tabs.Tab value="about">About</Tabs.Tab>
									<Tabs.Tab value="receiver">Receiver</Tabs.Tab>
									<Tabs.Tab value="sender">Sender</Tabs.Tab>
								</Tabs.List>
						
								<Tabs.Panel value="about">
									<Space h="md" />
									<Title order={2}>Web-Stringer</Title>	
											<Divider my="xs" />
									<ScrollArea h={"calc(100% - 6rem)"} type="auto" scrollbarSize={3}>
											<Text size="xs">This uses PeerJS and WebRTC technology to provide an easy way of sending data across clients without a backend (essentially). This application is hosted on github, and uses a freely available PeerJS and TURN server, providng remote connection without requiring beckend development.</Text> <Space h="md"/>
<Text size="xs">Users can choose to be either sender or receiver. A receiver will be given a random id that can then be used by senders to connect to the receiver. Once a sender is connected to the receiver, they can send data to the receiver. This isn't intended to be a two way connection, so the receiver can not respond to the sender.</Text>
	<Space h="md"/>	
	<Text size="xs">This tool was mainly created to provide a simple an easy way to copy and paste across electronic devices. Click on the text received to copy it to your clipboard.</Text>		<Space h="md"/>
						<Text size="xs">Developed by <a href="https://www.github.com/anthonymesa">Anthony Mesa</a></Text>
						</ScrollArea>
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
