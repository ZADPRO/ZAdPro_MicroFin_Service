import { ProductRepository } from "./product-Repository";

export class ProductResolver {
  public ProductRepository: any;
  constructor() {
    this.ProductRepository = new ProductRepository();
  }
  public async productOptionsV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    return await this.ProductRepository.productOptionsV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async addProductV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    return await this.ProductRepository.addProductV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async upDateProductV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    return await this.ProductRepository.upDateProductV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async productListV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    return await this.ProductRepository.productListV1(
      user_data,
      token_data,
      domain_code
    );
  }
}
