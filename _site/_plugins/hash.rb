class Hash
  # works like dig, just writes instead of reads
  def dig_assignment(*keys, value)
    last_key = keys.pop
    hash = keys.reduce(self) { |hash, key| hash[key].nil? ? hash[key] = {} : hash[key] }

    # if the last key exists, add the new value to it (ie appends to Array values)
    hash.has_key?(last_key) ? hash[last_key] += value : hash[last_key] = value
  end
end
