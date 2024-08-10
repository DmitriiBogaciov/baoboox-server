import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';

interface requestOption {
  method: string;
  url: string;
  headers?: any;
}

@Injectable()
export class UserService {
  constructor(private httpService: HttpService) { }

  async getManToken() {
    const options = {
      method: 'POST',
      url: 'https://dev-3bvkk0hsrquz68yn.us.auth0.com/oauth/token',
      headers: { 'content-type': 'application/json' },
      data: {
        client_id: process.env.AUTH0_CLIENT_ID,
        client_secret: process.env.AUTH0_CLIENT_MAN_SECRET,
        audience: 'https://dev-3bvkk0hsrquz68yn.us.auth0.com/api/v2/',
        grant_type: 'client_credentials'
      }
    };

    try {
      const response = await firstValueFrom(this.httpService.post(options.url, options.data, { headers: options.headers }));
      return response.data;
    } catch (error) {
      console.error('Error fetching token:', error.message);
      throw error;
    }
  }

  async getUserInfo(id: string) {

    const token = await this.getManToken();

    const options = {
      method: 'GET',
      url: `${process.env.AUTH0_ISSUER_BASE_URL}/api/v2/users/${id}`,
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token.access_token}`
      }
    }

    try {
      const response = await this.makeRequest(options);
      return response;
    } catch (error) {
      throw error;
    }
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  private async makeRequest(options: requestOption) {
    const token = await this.getManToken();

    if (!options.headers) {
      options.headers = {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token.access_token}`
      }
    }

    try {
      const response = await firstValueFrom(this.httpService.request(options));
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}
