import Peer from "peerjs";

export let peer: Peer | null = null;
export const connectPeer = (id: string) => {
  if(peer){
    peer.destroy()
  }
   peer = new Peer(id, {
    host: "localhost",
    port: 3000,
    path:"/peerjs",
    secure: false,
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

