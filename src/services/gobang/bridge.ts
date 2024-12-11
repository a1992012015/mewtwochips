import { EventResType, EWorkerAction } from "@/types/gobang/bridge.type";

let worker: Worker;

const getWorkerInstance = () => {
  if (!worker) {
    worker = new Worker(new URL("./1.0.0/bridge.worker", import.meta.url));

    console.log("bridge create worker ===>", worker);
  }

  return worker;
};

export const start = async (first: boolean, depth: number) => {
  return new Promise<EventResType["payload"]>((resolve) => {
    console.log(getWorkerInstance());

    getWorkerInstance().postMessage({ action: EWorkerAction.START, payload: { first, depth } });

    getWorkerInstance().onmessage = (event: MessageEvent<EventResType>) => {
      const { action, payload } = event.data;
      if (action === EWorkerAction.START) {
        resolve(payload);
      }
    };
  });
};

export const play = async (position: [number, number]) => {
  return new Promise<EventResType["payload"]>((resolve) => {
    getWorkerInstance().postMessage({ action: EWorkerAction.PLAY, payload: { position } });

    getWorkerInstance().onmessage = (event: MessageEvent<EventResType>) => {
      const { action, payload } = event.data;
      if (action === EWorkerAction.PLAY) {
        resolve(payload);
      }
    };
  });
};

export const undo = async () => {
  return new Promise<EventResType["payload"]>((resolve) => {
    getWorkerInstance().postMessage({ action: EWorkerAction.UNDO });

    getWorkerInstance().onmessage = (event: MessageEvent<EventResType>) => {
      const { action, payload } = event.data;
      if (action === EWorkerAction.UNDO) {
        resolve(payload);
      }
    };
  });
};

export const end = async () => {
  return new Promise<EventResType["payload"]>((resolve) => {
    getWorkerInstance().postMessage({ action: EWorkerAction.END });

    getWorkerInstance().onmessage = (event: MessageEvent<EventResType>) => {
      const { action, payload } = event.data;
      if (action === EWorkerAction.END) {
        resolve(payload);
      }
    };
  });
};
