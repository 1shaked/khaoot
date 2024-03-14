import { UserDetailsSchemaType } from '@/pages/home/home'
import {atom} from 'jotai'

export const UserGlobalAtom = atom<UserDetailsSchemaType | null>(null)