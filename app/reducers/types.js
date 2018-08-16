export type imageType = {
  +path: string,
  +name: string
};

export type albumType = {
  +id: string,
  +cover: string,
  +path: string,
  +name: string,
  +images: Array<imageType>
};

export type albumsStateType = {
  +albums: Array<albumType>
};
