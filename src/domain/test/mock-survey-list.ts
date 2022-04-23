import { SurveyModel } from '@/domain/models'
import faker from 'faker'

const mockSurveyList = (): SurveyModel[] => [
  {
    id: faker.datatype.uuid(),
    question: faker.random.words(),
    date: faker.date.recent(),
    answers: [
      {
        image: faker.image.imageUrl(),
        answer: faker.random.word()
      },
      {
        answer: faker.random.word()
      }
    ],
    didAnswer: faker.datatype.boolean()
  }
]

export { mockSurveyList }