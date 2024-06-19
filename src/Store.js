import { create } from "zustand";
import assert from "assert";
import Peer from "peerjs";
import timestamp from "time-stamp";

export const peer = new Peer(null, {
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
});

export const useAppStore = create((set) => ({
    role: "",
    receiverId: "",
    senderId: "",
    receiving: false,
    connection: null,
    dataLog: [],
    setRole: (value) => {
        assert(
            ["sender", "receiver", ""].includes(value),
            "Store.useAppStore.setRole(value): Unexpected value."
        );
        set({ role: value });
    },
    openConnection: () => {
        set((state) => {
            assert(
                !state.connection,
                "Store.openConnection: Connection exists."
            );

            const conn = peer.connect(state.receiverId);

            conn.on("open", () => {
                conn.send("Hello!");
            });
            conn.on("data", (data) => {
                console.log(data);
            });

            return { connection: conn };
        });
    },
    closeConnection: () => {
        set({ connection: null });
    },
    setReceiverId: (value) => {
        assert(
            typeof value != String,
            "Store.setReveiverId: Id must be string"
        );
        set({ receiverId: value });
    },
    beginReceiving: () => {
        peer.on("connection", (conn) => {
            conn.on("data", (data) => {
                set((state) => ({
                    dataLog: [
                        ...state.dataLog,
                        `${timestamp("YYYY/MM/DD HH:mm:ss")} - ${
                            conn.peer
                        } - ${data}`,
                    ],
                }));
            });
            conn.on("open", () => {
                console.log("Connected successfully");
            });
        });
        set({ receiving: true });
    },
    clearDataLog: () => {
        set({ dataLog: [] });
    },
}));
