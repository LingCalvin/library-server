import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Book } from './entities/book.entity';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book) private booksRepository: Repository<Book>,
  ) {}

  create({ isbn, title }: CreateBookDto) {
    const book = new Book();
    book.isbn = isbn;
    book.title = title;
    return this.booksRepository.save(book);
  }

  findAll() {
    return this.booksRepository.find();
  }

  findOne(id: string) {
    return this.booksRepository.findOne(id);
  }

  update(id: string, updateBookDto: UpdateBookDto) {
    return this.booksRepository.update(id, updateBookDto);
  }

  remove(id: string) {
    return this.booksRepository.delete(id);
  }
}
