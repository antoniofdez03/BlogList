const listHelper = require('../utils/list_helper')

test('dummy returns one', () => {
    const blogs = []

    const result = listHelper.dummy(blogs)
    expect(result).toBe(1)
})

describe('Total likes', () => {
    test('of empty list is zero', () => {
        const blogs = []

        const result = listHelper.totalLikes(blogs)
        expect(result).toBe(0)
    })

    test('When list has only one blog equals the likes of that', () => {
        const blogs = [
            {
                "likes": 3
            }
        ]

        const result = listHelper.totalLikes(blogs)
        expect(result).toBe(blogs[0].likes) 
    })

    test('of a bigger list is calculated right', () => {
        const blogs = [
            {
                "likes": 3
            },
            {
                "likes": 2
            }
        ]

        const result = listHelper.totalLikes(blogs)
        expect(result).toBe(5) 
    })
})

describe('Favorite blog', () => {
    test('of empty list is null', () => {
        const blogs = []

        const result = listHelper.favoriteBlog(blogs)
        expect(result).toBe(null)
    })

    test('When list has only one blog equals that', () => {
        const blogs = [
            {            
                "title": "first blog",
                "author": "Antonio",
                "likes": 12
            }
        ]

        const result = listHelper.favoriteBlog(blogs)
        expect(result).toBe(blogs[0])
    })

    test('of a bigger list is calculated right', () => {
        const blogs = [
            {            
                "title": "first blog",
                "author": "Antonio",
                "likes": 5
            },
            {
                "title": "second blog",
                "author": "Antonio",
                "likes": 12
            },
            {
                "title": "third blog",
                "author": "anonymous",
                "likes": 8
            }
        ]

        const result = listHelper.favoriteBlog(blogs)
        expect(result).toBe(blogs[1])
    })
})