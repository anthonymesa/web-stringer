import { create } from "zustand";
import assert from "assert";
import Peer from "peerjs";
import timestamp from "time-stamp";

const peerConfig = {
    config: {
        iceServers: [{
            urls: 'stun:freeturn.net:3478',
        }, {
	    urls: 'turn:freeturn.net:3478',
            username: 'free',
            credential: 'free',
        }],
        sdpSemantics: 'unified-plan',
        debug: 3,
    }
};

export const useAppStore = create((set, get) => ({
    role: "about",
    clientId: "",
    receiverId: "",
    senderState: "disconnected",
    receiverState: "disconnected",
    closeSenderConnection: () => {},
    stopReceiving: () => {},
    sendToReceiver: () => {},
	content: "",
    dataLog: [],
    setSenderState: (value) => {
	assert(
	    ["disconnected", "waiting", "connected"].includes(value), 
	    "Store.setSenderState.setSenderState(value): Unexpected value."
	);

    	set({ senderState: value});
    },
    setReceiverState: (value) => {
	assert(
	    ["disconnected", "waiting", "connected"].includes(value), 
	    "Store.setReceiverState.setReceiverState(value): Unexpected value."
	);

    	set({ receiverState: value})
    },
    setRole: (value) => {
        assert(
            ["sender", "receiver", "about"].includes(value),
            "Store.useAppStore.setRole(value): Unexpected value."
        );
        set({ role: value });
    },
    setContent: (value) => {
	    set({content: value});
    },
    openConnection: () => {
	const peer = new Peer(null, peerConfig);
	    
        get().setSenderState("waiting");
	
	set({closeSenderConnection: () => {
		get().setSenderState("disconnected");
		peer.destroy();
	}});

	peer.on("open", () => {
		const conn = peer.connect(get().receiverId);
	
		conn.on("open", () => {
		    get().setSenderState("connected");
			set({sendToReceiver: (value) => conn.send(value)});
		});

		conn.on("data", (data) => {
		    console.log(data);
		});

		conn.on("close", () => {
		    get().setSenderState("disconnected");
			set({sendToReceiver: () => {}});
		});
		    
		conn.on("error", (e) => {
			console.error(e)
			get().setSenderState("disconnected");
			set({sendToReceiver: () => {}});
		})
        });
    },
    closeConnection: () => {
        get().closeSenderConnection();
	get().stopReceiving();
	get().setSenderState("disconnected");
	get().setReceiverState("disconnected");
    },
    setReceiverId: (value) => {
        assert(
            typeof value != String,
            "Store.setReveiverId: Id must be string"
        );
        set({ receiverId: value });
    },
    beginReceiving: () => {
	get().setReceiverState("waiting");
        set({ receiving: true });
       
	const peer = new Peer(null, peerConfig);
	
	peer.on("open", () => {
		get().setReceiverState("connected");
		set({clientId: peer.id});
	})

        peer.on("connection", (conn) => {
		
            conn.on("open", () => {
		get().appendDataLog(conn.peer, 'connected');
	    });

            conn.on("data", (data) => {
		get().appendDataLog(conn.peer, data)
            });

	    conn.on("close", (id) => {
		get().appendDataLog(conn.peer, 'disconnected');		
	    });

	    conn.on("error", (e) => {
		get().setReceiverState("disconnected");
	    });
        });

	set({ stopReceiving: () => {
			peer.destroy()
			get().setReceiverState("disconnected");
			set({clientId: ""});
			get().clearDataLog();
		}
	});
    },
    appendDataLog: (id, text) => {
	set((state) => ({
		dataLog: [
			...state.dataLog,
                        `${timestamp("YYYY/MM/DD HH:mm:ss")} - ${id} - ${text}`,
		],
	}));
    },
    clearDataLog: () => {
        set({ dataLog: [] });
    },
}));
