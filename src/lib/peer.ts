import Peer from "peerjs";

export let peer: Peer | null = null;
export const connectPeer = (id: string) => {
  if(peer){
    peer.destroy()
  }
  
  const peerHost = (import.meta.env.VITE_PEER_HOST || "localhost").trim();
  const peerPort = import.meta.env.VITE_PEER_PORT 
    ? parseInt(import.meta.env.VITE_PEER_PORT, 10) 
    : 3000;
  const peerSecure = import.meta.env.VITE_PEER_SECURE?.trim() === "true";
  
  peer = new Peer(id, {
    host: peerHost,
    port: peerPort,
    path: "/peerjs",
    secure: peerSecure,
    config: {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
        ]
    }
  });
  
  peer.on("open", (id) => {
    console.log("Peer connected:", id);
  });

  peer.on("error", (err) => {
    console.log("Peer error:", err);
  });

  return peer;
};

