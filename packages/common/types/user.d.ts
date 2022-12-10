declare namespace NUser {
  type Item = import('@prisma/client').User

  type InputParam = Pick<Item, 'username'>
}
