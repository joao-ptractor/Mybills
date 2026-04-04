import { Inject, Injectable } from '@nestjs/common';
import { AlreadyExistsError } from 'src/common/errors/already-exists.error';
import { InvalidArgumentError } from 'src/common/errors/invalid-argument.error';
import { NotFoundError } from 'src/common/errors/not-found.error';
import { CategoryRepository } from './repositories/category.repository';
import { Category } from './entities/category.entity';
import { CreateCategoryData } from './contracts/create-category-data.contract';
import { UpdateCategoryData } from './contracts/update-category-data.contract';

@Injectable()
export class CategoriesService {
  constructor(@Inject('CategoryRepository') private readonly repository: CategoryRepository) {}

  async findAll(userId: string): Promise<Category[]> {
    this.validateUserId(userId);

    return await this.repository.findAllByUserId(userId);
  }

  async findById(categoryId: string, userId: string): Promise<Category> {
    this.validateCategoryId(categoryId);
    this.validateUserId(userId);

    const category = await this.repository.findByIdAndUserId(categoryId, userId);

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    return category;
  }

  async create(data: CreateCategoryData): Promise<Category> {
    this.validateCreateData(data);

    const normalizedName = data.name.trim();
    const existingCategory = await this.repository.findByNameAndUserId(normalizedName, data.userId);

    if (existingCategory) {
      throw new AlreadyExistsError('Category already exists');
    }

    return await this.repository.create({
      userId: data.userId,
      name: normalizedName
    });
  }

  async update(categoryId: string, userId: string, data: UpdateCategoryData): Promise<Category> {
    this.validateCategoryId(categoryId);
    this.validateUserId(userId);
    this.validateUpdateData(data);

    await this.findById(categoryId, userId);

    let normalizedName: string | undefined;

    if (data.name !== undefined) {
      normalizedName = data.name.trim();

      const existingCategory = await this.repository.findByNameAndUserId(normalizedName, userId);

      if (existingCategory && existingCategory.id !== categoryId) {
        throw new AlreadyExistsError('Category already exists');
      }
    }

    return await this.repository.update(categoryId, {
      name: normalizedName
    });
  }

  async remove(categoryId: string, userId: string): Promise<void> {
    this.validateCategoryId(categoryId);
    this.validateUserId(userId);

    await this.findById(categoryId, userId);
    await this.repository.delete(categoryId);
  }

  private validateCreateData(data: CreateCategoryData): void {
    this.validateUserId(data.userId);

    if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
      throw new InvalidArgumentError('Invalid category name');
    }
  }

  private validateUpdateData(data: UpdateCategoryData): void {
    if (data.name === undefined) {
      throw new InvalidArgumentError('At least one field must be provided');
    }

    if (
      data.name !== undefined &&
      (!data.name || typeof data.name !== 'string' || !data.name.trim())
    ) {
      throw new InvalidArgumentError('Invalid category name');
    }
  }

  private validateCategoryId(categoryId: string): void {
    if (!categoryId || typeof categoryId !== 'string') {
      throw new InvalidArgumentError('Invalid category id');
    }
  }

  private validateUserId(userId: string): void {
    if (!userId || typeof userId !== 'string') {
      throw new InvalidArgumentError('Invalid user id');
    }
  }
}
