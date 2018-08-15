export type imageType = {
  +path: string,
  +name: string
};

export type albumType = {
  +id: number,
  +cover: string,
  +path: string,
  +name: string,
  +images: Array<imageType>
};

export type albumsStateType = {
  +albums: Array<albumType>
};
