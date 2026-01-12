
import { useCallback } from 'react'
import { Stack, Text, TextInput } from '@sanity/ui'
import { StringInputProps, set, unset } from 'sanity'

export function MaskedInput(props: StringInputProps) {
  const { elementProps, onChange, value = '' } = props

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const nextValue = event.currentTarget.value
      onChange(nextValue ? set(nextValue) : unset())
    },
    [onChange]
  )

  return (
    <Stack space={2}>
      <TextInput
        {...elementProps}
        onChange={handleChange}
        value={value}
        type="password"
        placeholder="••••••••"
      />
      <Text muted size={1}>
        This value is masked but stored as plain text.
      </Text>
    </Stack>
  )
}
