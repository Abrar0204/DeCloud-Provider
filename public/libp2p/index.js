const createLibp2p = require("./createLibp2p.js");
const fs = require("fs");
const PeerId = require("peer-id");
const path = require("path");
const pipe = require("it-pipe");
const { BufferListStream } = require("bl/bl");
const streamSplitter = require("split-file-stream");
const { ipcMain } = require("electron");

const os = require("os");
const appDir = path.resolve(os.homedir(), ".DeCloud");

let accountNumber = "";

const startNode = async (win) => {
  let id;
  try {
    const idJson = require(path.join(__dirname, "./peer-id.json"));
    id = await PeerId.createFromJSON(idJson);
  } catch (err) {
    id = await PeerId.create({ bits: 1024, keyType: "RSA" });
    fs.writeFile(
      path.join(__dirname, "./peer-id.json"),
      JSON.stringify(id.toJSON(), null, 2),
      (err) => {
        if (err) {
          console.log(err);
        }
      }
    );
  }
  const node = await createLibp2p({
    peerId: id,
    addresses: {
      listen: ["/ip4/0.0.0.0/tcp/0"],
    },
  });

  ipcMain.on("account-number", (_, data) => {
    accountNumber = data;
    console.log("[INFO] account number: ", accountNumber);
  });

  node.connectionManager.on("peer:connect", (connection) => {
    console.log("connected to: ", connection.remotePeer.toB58String());
  });

  await node.start();

  // Output this node's address
  console.log("Dialer ready, listening on:");
  node.multiaddrs.forEach((ma) => {
    console.log(ma.toString() + "/p2p/" + id.toB58String());
  });

  node.handle("/decloud/get-file/1.0.0", async ({ stream }) => {
    pipe(stream, async (source) => {
      for await (const msg of source) {
        const { fileHash, splitInto } = JSON.parse(msg.toString().trim());
        console.log(fileHash, splitInto);
        const filePaths = [];
        for (let i = 0; i < splitInto; i++) {
          filePaths.push(`${appDir}/${fileHash}.enc.split-${i}`);
        }

        streamSplitter.mergeFilesToStream(filePaths, (outStream) => {
          pipe(outStream, stream);
        });
      }
    });
  });

  node.handle("/decloud/send-file/1.0.0", async ({ stream }) => {
    try {
      await pipe(stream, async function (source) {
        const bl = new BufferListStream();

        for await (const msg of source) {
          bl.append(msg);
        }

        const filehash = bl._bufs[0].slice(0, 64).toString().trim();

        //Removing filehash from the start of the stream
        // let newStartingBuffer = bl._bufs[0].slice(64);
        // bl._bufs[0] = newStartingBuffer;

        const filename = filehash + ".enc";

        console.log(filename);
        // const readStream = streamifier.createReadStream()

        // console.log(path.join(appDir, filename));
        // const writeStream = fs.createWriteStream(path.join(appDir, filename));
        // Creates the file
        // console.log(bl);
        // bl.pipe(writeStream);
        streamSplitter.split(
          bl,
          102400,
          path.join(appDir, filename),
          (error, filePaths) => {
            /* If an error occured, filePaths will still contain all files that were written */
            if (error) {
              console.log(error);
              throw error;
            } // Alternatively you could just log the error instead of throwing: if (error) console.error(error)

            console.log("This is an array of my new files:", filePaths);
            pipe(
              [JSON.stringify({ accountNumber, splitInto: filePaths.length })],
              stream
            );

            /* stream will be saved to files in the path ∈ { ./outputFiles.split-x | x ∈ N } */
          }
        );
      });
    } catch (err) {
      console.log(err);
    }
  });
};

module.exports = { startNode };
