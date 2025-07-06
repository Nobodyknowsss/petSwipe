export interface PetFormData {
  name: string;
  breed: string;
  age: string;
  gender: string;
  location: string;
  description: string;
  type: string;
}

export interface MediaFile {
  uri: string;
  type: "image" | "video";
}

export interface LoadingState {
  image: boolean;
  video: boolean;
}
