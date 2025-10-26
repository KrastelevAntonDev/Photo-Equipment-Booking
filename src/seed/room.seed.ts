import { RoomMongoRepository } from '@modules/rooms/infrastructure/room.mongo.repository';
import { Room } from '@/modules/rooms/domain/room.entity';
const rooms: Room[] = [
	{
		name: 'Авангард',
		address: '',
		area: 0,
		pricePerHour: 0,
		colorScheme: [],
		styles: [],
		description: '',
		images: []
	},
	{
		name: 'Афродита',
		address: '',
		area: 0,
		pricePerHour: 0,
		colorScheme: [],
		styles: [],
		description: '',
		images: []
	},
		{
		name: 'Бистро',
		address: '',
		area: 0,
		pricePerHour: 0,
		colorScheme: [],
		styles: [],
		description: '',
		images: []
	},
		{
		name: 'Два лика',
		address: '',
		area: 0,
		pricePerHour: 0,
		colorScheme: [],
		styles: [],
		description: '',
		images: []
	},
		{
		name: 'Криптон',
		address: '',
		area: 0,
		pricePerHour: 0,
		colorScheme: [],
		styles: [],
		description: '',
		images: []
	},
		{
		name: 'Лофт рум',
		address: '',
		area: 0,
		pricePerHour: 0,
		colorScheme: [],
		styles: [],
		description: '',
		images: []
	},
		{
		name: 'Мануфактура',
		address: '',
		area: 0,
		pricePerHour: 0,
		colorScheme: [],
		styles: [],
		description: '',
		images: []
	},
		{
		name: 'Мулен руж',
		address: '',
		area: 0,
		pricePerHour: 0,
		colorScheme: [],
		styles: [],
		description: '',
		images: []
	},
		{
		name: 'Оазис',
		address: '',
		area: 0,
		pricePerHour: 0,
		colorScheme: [],
		styles: [],
		description: '',
		images: []
	},
		{
		name: 'Остерия',
		address: '',
		area: 0,
		pricePerHour: 0,
		colorScheme: [],
		styles: [],
		description: '',
		images: []
	},
		{
		name: 'Подкастная',
		address: '',
		area: 0,
		pricePerHour: 0,
		colorScheme: [],
		styles: [],
		description: '',
		images: []
	},
		{
		name: 'Пьер',
		address: '',
		area: 0,
		pricePerHour: 0,
		colorScheme: [],
		styles: [],
		description: '',
		images: []
	},
		{
		name: 'Рай',
		address: '',
		area: 0,
		pricePerHour: 0,
		colorScheme: [],
		styles: [],
		description: '',
		images: []
	},
			{
		name: 'Сатурн',
		address: '',
		area: 0,
		pricePerHour: 0,
		colorScheme: [],
		styles: [],
		description: '',
		images: []
	},
			{
		name: 'Улицы',
		address: '',
		area: 0,
		pricePerHour: 0,
		colorScheme: [],
		styles: [],
		description: '',
		images: []
	},
			{
		name: 'Хром',
		address: '',
		area: 0,
		pricePerHour: 0,
		colorScheme: [],
		styles: [],
		description: '',
		images: []
	},
			{
		name: 'Чайковский',
		address: '',
		area: 0,
		pricePerHour: 0,
		colorScheme: [],
		styles: [],
		description: '',
		images: []
	},
];

export async function seedRooms() {
	const repo = new RoomMongoRepository();
	for (const room of rooms) {
		const exists = await repo.findByName(room.name);
		if (!exists) {
			await repo.createRoom(room);
			console.log(`Room ${room.name} created`);
		} else {
			console.log(`Room ${room.name} already exists`);
		}
	}
}
