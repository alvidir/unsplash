import { Server, ServerUnaryCall, sendUnaryData, ServerCredentials } from 'grpc';
import { IApiServer, ApiService } from '../proto/api_grpc_pb';
import * as pb from '../proto/api_pb';
import { GetInstance as CacheInstance } from '../cache/public';
import {ImageInfo} from '../api/interfaces';

function ProtobufAdapter(img: ImageInfo): pb.Image {
    const urls: Map<string, string> = JSON.parse(img.Urls());
    const likes = img.Likes();
    const bio = img.Bio();
    const prof_img = img.ProfileImage();
    
    let response = new pb.Image();
    response.setAuthor(img.Author());
    response.setProfile(img.Profile());

    let protomap = response.getUrlsMap();
    urls.forEach(function(value: string, key: string, map: Map<string, string>): void {
        protomap[key] = value
    });

    if (likes){
        response.setLikes(likes);
    }
    if (bio){
        response.setBio(bio);
    }
    if (prof_img){
        response.setProfileImage(prof_img);
    }

    return response;
}

class ApiImplementation implements IApiServer {
    public single(_: ServerUnaryCall<pb.EmptyRequest>, callback: sendUnaryData<pb.Image>): void {
        const image = CacheInstance().GetSingle();
        const value = ProtobufAdapter(image);
        callback(null, value, undefined, undefined);
    }
}

//create a server object
const server = new Server();
server.addService<IApiServer>(ApiService, new ApiImplementation());

export function GetInstance(): Server {
    return server;
}

const credential = ServerCredentials.createInsecure();
export function GetCredential(): ServerCredentials {
    return credential;
}